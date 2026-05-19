import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const cacheKey = `analytics:${user.id}`
    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json({ success: true, data: cached, cached: true })

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Parallel queries
    const [
      totalVideos,
      readyVideos,
      recentVideos,
      topVideos,
      analyticsData,
      publishedPosts,
    ] = await Promise.all([
      prisma.video.count({ where: { userId: user.id } }),
      prisma.video.count({ where: { userId: user.id, status: 'READY' } }),
      prisma.video.count({ where: { userId: user.id, createdAt: { gte: since } } }),
      prisma.video.findMany({
        where: { userId: user.id, status: { in: ['READY', 'PUBLISHED'] } },
        orderBy: { totalViews: 'desc' },
        take: 10,
        select: { id: true, title: true, thumbnailUrl: true, totalViews: true, viralScore: true, createdAt: true, publishedAt: true },
      }),
      prisma.videoAnalytics.findMany({
        where: { video: { userId: user.id }, date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
      prisma.publishedPost.findMany({
        where: { video: { userId: user.id } },
        select: { platform: true, views: true, likes: true, status: true },
      }),
    ])

    // Compute stats
    const totalViewsAgg = await prisma.video.aggregate({
      where: { userId: user.id },
      _sum: { totalViews: true },
    })

    const avgViralScore = await prisma.video.aggregate({
      where: { userId: user.id, viralScore: { not: null } },
      _avg: { viralScore: true },
    })

    // Platform breakdown
    const platformBreakdown = publishedPosts.reduce((acc, post) => {
      const key = post.platform
      if (!acc[key]) acc[key] = { platform: key, posts: 0, views: 0, likes: 0 }
      acc[key].posts++
      acc[key].views += Number(post.views ?? 0)
      acc[key].likes += Number(post.likes ?? 0)
      return acc
    }, {} as Record<string, { platform: string; posts: number; views: number; likes: number }>)

    // Daily views chart data
    const viewsByDay = analyticsData.reduce((acc, row) => {
      const day = row.date.toISOString().split('T')[0]
      if (!acc[day]) acc[day] = { date: day, views: 0, likes: 0 }
      acc[day].views += Number(row.views)
      acc[day].likes += Number(row.likes)
      return acc
    }, {} as Record<string, { date: string; views: number; likes: number }>)

    const analytics = {
      summary: {
        totalVideos,
        readyVideos,
        recentVideos,
        totalViews: Number(totalViewsAgg._sum.totalViews ?? 0),
        avgViralScore: Math.round((avgViralScore._avg.viralScore ?? 0) * 10) / 10,
        publishedPosts: publishedPosts.length,
        credits: user.credits + user.bonusCredits,
        creditsUsed: user.creditsUsed,
        streak: user.streak,
        level: user.level,
      },
      topVideos,
      platformBreakdown: Object.values(platformBreakdown),
      viewsByDay: Object.values(viewsByDay).sort((a, b) => a.date.localeCompare(b.date)),
      range,
    }

    await setCache(cacheKey, analytics, 300) // 5 min cache

    return NextResponse.json({ success: true, data: analytics, cached: false })
  } catch (error) {
    console.error('[/api/analytics]', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
