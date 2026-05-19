import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateScript, generateHooks } from '@/lib/ai'
import { deductCredits } from '@/lib/credits'
import { CREDIT_COSTS } from '@/types'
import { checkRateLimit } from '@/lib/redis'

const ScriptSchema = z.object({
  topic: z.string().min(3).max(300),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK']).default('TIKTOK'),
  niche: z.string().optional(),
  framework: z.enum(['hook-story-cta', 'problem-solution', 'listicle', 'tutorial', 'storytime']).optional().default('hook-story-cta'),
  tone: z.enum(['professional', 'casual', 'energetic', 'calm', 'authoritative']).optional().default('energetic'),
  duration: z.number().min(15).max(180).optional().default(60),
  includeHook: z.boolean().optional().default(true),
  includeCta: z.boolean().optional().default(true),
  generateAlternativeHooks: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limit: 30 scripts per hour
    const rateLimit = await checkRateLimit(`script:${clerkId}`, 30, 3600)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', resetIn: rateLimit.resetIn }, { status: 429 })
    }

    const body = await request.json()
    const input = ScriptSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const creditCost = CREDIT_COSTS.script_generation.cost
    const totalCredits = user.credits + user.bonusCredits

    if (totalCredits < creditCost) {
      return NextResponse.json({
        error: 'Insufficient credits',
        creditsRequired: creditCost,
        creditsAvailable: totalCredits,
      }, { status: 402 })
    }

    // Generate script with Claude
    const [script, hooks] = await Promise.all([
      generateScript(input),
      input.generateAlternativeHooks ? generateHooks(input.topic, 5) : Promise.resolve([]),
    ])

    // Deduct credits
    await deductCredits({
      userId: user.id,
      amount: creditCost,
      action: 'script_generation',
    })

    // Save to DB
    const saved = await prisma.script.create({
      data: {
        userId: user.id,
        title: script.title,
        hook: script.hook,
        body: script.body,
        cta: script.cta,
        platform: input.platform as Parameters<typeof prisma.script.create>[0]['data']['platform'],
        niche: input.niche,
        wordCount: script.wordCount,
        estimatedDuration: script.estimatedDuration,
        viralScore: script.viralScore,
        hookScore: script.hookScore,
        framework: input.framework,
      },
    })

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } })

    return NextResponse.json({
      success: true,
      data: {
        script: saved,
        alternativeHooks: hooks,
        creditsUsed: creditCost,
        creditsRemaining: (updatedUser?.credits ?? 0) + (updatedUser?.bonusCredits ?? 0),
      },
    })
  } catch (error) {
    console.error('[/api/scripts/generate]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Script generation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const [scripts, total] = await Promise.all([
      prisma.script.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.script.count({ where: { userId: user.id } }),
    ])

    return NextResponse.json({ success: true, data: { items: scripts, total, page, pageSize, hasMore: page * pageSize < total } })
  } catch (error) {
    console.error('[/api/scripts GET]', error)
    return NextResponse.json({ error: 'Failed to fetch scripts' }, { status: 500 })
  }
}
