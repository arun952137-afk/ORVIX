import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { scanTrends } from '@/lib/ai'
import { getCache, setCache } from '@/lib/redis'
import { prisma } from '@/lib/prisma'
import { CREDIT_COSTS } from '@/types'
import { deductCredits } from '@/lib/credits'
import type { Platform } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const niche = searchParams.get('niche') || 'AI & Technology'
    const platform = (searchParams.get('platform') || 'TIKTOK') as Platform
    const refresh = searchParams.get('refresh') === 'true'

    // Cache key
    const cacheKey = `trends:${platform}:${niche.replace(/\s+/g, '_').toLowerCase()}`

    // Return cached unless refresh requested
    if (!refresh) {
      const cached = await getCache(cacheKey)
      if (cached) {
        return NextResponse.json({ success: true, data: cached, cached: true })
      }
    }

    // Check user exists and has credits for fresh scan
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (refresh && user.plan === 'FREE') {
      return NextResponse.json({
        error: 'Trend scanner requires Pro or Elite plan',
        upgradeRequired: true,
      }, { status: 403 })
    }

    // Deduct credits for fresh scan
    if (refresh) {
      const creditCost = CREDIT_COSTS.trend_scan.cost
      const total = user.credits + user.bonusCredits
      if (total < creditCost) {
        return NextResponse.json({ error: 'Insufficient credits', creditsRequired: creditCost }, { status: 402 })
      }
      await deductCredits({ userId: user.id, amount: creditCost, action: 'trend_scan' })
    }

    // Scan trends
    const trends = await scanTrends(niche, platform)

    // Store in DB and cache
    await setCache(cacheKey, trends, 7200) // 2 hour cache

    // Persist to DB for historical tracking
    for (const trend of trends.slice(0, 5)) {
      await prisma.trendData.upsert({
        where: { keyword_platform: { keyword: trend.keyword, platform } },
        create: {
          keyword: trend.keyword,
          platform,
          niche,
          viewCount: trend.viewCount ?? 0,
          growth: trend.growth ?? 0,
          viralScore: trend.viralScore,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        update: {
          viewCount: trend.viewCount ?? 0,
          growth: trend.growth ?? 0,
          viralScore: trend.viralScore,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    return NextResponse.json({ success: true, data: trends, cached: false })
  } catch (error) {
    console.error('[/api/trends]', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
