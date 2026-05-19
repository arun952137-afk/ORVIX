// ORVIX — /api/videos/generate
// POST: Queue AI video generation job

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateScript, analyzeViralPotential } from '@/lib/ai'
import { deductCredits } from '@/lib/credits'
import { queueVideoRender } from '@/lib/queue'
import { CREDIT_COSTS } from '@/types'

const GenerateSchema = z.object({
  prompt: z.string().min(5).max(500),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK']).optional().default('TIKTOK'),
  niche: z.string().optional(),
  duration: z.number().min(15).max(180).optional().default(60),
  voiceProfileId: z.string().optional(),
  resolution: z.enum(['720p', '1080p', '4k']).optional().default('1080p'),
  captionStyle: z.enum(['cinematic', 'minimal', 'bold', 'none']).optional().default('cinematic'),
  brollStyle: z.enum(['auto', 'cinematic', 'documentary']).optional().default('auto'),
  language: z.string().optional().default('en'),
  musicTrack: z.string().optional(),
  includeHook: z.boolean().optional().default(true),
  includeCta: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const input = GenerateSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Calculate credit cost
    const resolutionAction = input.resolution === '4k'
      ? 'video_reel_4k'
      : input.resolution === '1080p'
        ? 'video_reel_1080p'
        : 'video_reel_720p'

    const creditCost = CREDIT_COSTS[resolutionAction].cost

    // Check and deduct credits
    const totalCredits = user.credits + user.bonusCredits
    if (totalCredits < creditCost) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        creditsRequired: creditCost,
        creditsAvailable: totalCredits,
        upgradeRequired: user.plan === 'FREE',
      }, { status: 402 })
    }

    // Generate script with AI
    const script = await generateScript({
      topic: input.prompt,
      platform: input.platform as Parameters<typeof generateScript>[0]['platform'],
      niche: input.niche,
      duration: input.duration,
      framework: 'hook-story-cta',
      tone: 'energetic',
      includeHook: input.includeHook,
      includeCta: input.includeCta,
    })

    // Analyze viral potential
    const viral = await analyzeViralPotential({
      title: script.title,
      hook: script.hook,
      body: script.body,
      platform: input.platform as Parameters<typeof analyzeViralPotential>[0]['platform'],
      niche: input.niche,
    })

    // Create video record
    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title: script.title,
        prompt: input.prompt,
        status: 'QUEUED',
        renderProgress: 0,
        aspectRatio: '9:16',
        resolution: input.resolution,
        voiceProfileId: input.voiceProfileId,
        captionStyle: input.captionStyle,
        brollStyle: input.brollStyle,
        musicTrack: input.musicTrack,
        language: input.language,
        viralScore: viral.viralScore,
        hookScore: viral.hookScore,
        retentionScore: viral.retentionScore,
        estimatedReach: viral.estimatedReach.high,
        niche: input.niche,
        hasWatermark: user.plan === 'FREE',
        tags: [input.niche || input.platform.toLowerCase()].filter(Boolean),
      },
    })

    // Create script record
    await prisma.script.create({
      data: {
        userId: user.id,
        title: script.title,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        platform: input.platform as Parameters<typeof generateScript>[0]['platform'],
        niche: input.niche,
        wordCount: script.wordCount,
        estimatedDuration: script.estimatedDuration,
        viralScore: viral.viralScore,
        hookScore: viral.hookScore,
      },
    })

    // Deduct credits
    await deductCredits({
      userId: user.id,
      amount: creditCost,
      action: resolutionAction,
      videoId: video.id,
    })

    // Queue render job
    await queueVideoRender({
      videoId: video.id,
      userId: user.id,
      script,
      config: {
        platform: input.platform,
        resolution: input.resolution,
        voiceProfileId: input.voiceProfileId,
        captionStyle: input.captionStyle,
        brollStyle: input.brollStyle,
        musicTrack: input.musicTrack,
        language: input.language,
        duration: input.duration,
      },
    })

    // Update user stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalVideos: { increment: 1 },
        lastActiveAt: new Date(),
        xp: { increment: 50 },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'VIDEO_READY',
        title: 'Video queued for rendering',
        body: `"${script.title}" is in the render queue. Estimated time: 60-90 seconds.`,
        data: { videoId: video.id },
      },
    })

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })

    return NextResponse.json({
      success: true,
      data: {
        videoId: video.id,
        jobId: `job_${video.id}`,
        estimatedTime: 75,
        creditsUsed: creditCost,
        creditsRemaining: (updatedUser?.credits ?? 0) + (updatedUser?.bonusCredits ?? 0),
        viralScore: viral.viralScore,
        estimatedReach: viral.estimatedReach,
        script: {
          title: script.title,
          hook: script.hook,
          viralScore: viral.viralScore,
          suggestions: viral.suggestions,
        },
      },
    })
  } catch (error) {
    console.error('[/api/videos/generate]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 })
  }
}

// GET: List user videos
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const niche = searchParams.get('niche')
    const search = searchParams.get('search')

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const where: Record<string, unknown> = { userId: user.id }
    if (status) where.status = status
    if (niche) where.niche = niche
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          publishedPosts: { select: { platform: true, status: true, views: true } },
        },
      }),
      prisma.video.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: videos,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    })
  } catch (error) {
    console.error('[/api/videos GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch videos' }, { status: 500 })
  }
}
