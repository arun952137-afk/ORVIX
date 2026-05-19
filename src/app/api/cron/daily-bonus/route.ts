import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { grantDailyBonus, grantStreakReward } from '@/lib/credits'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all active users from last 48h
    const activeUsers = await prisma.user.findMany({
      where: { lastActiveAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } },
      select: { id: true, streak: true, plan: true },
    })

    let processed = 0
    let streakRewards = 0

    for (const user of activeUsers) {
      try {
        await grantDailyBonus(user.id)
        processed++

        // Check streak milestones
        const newStreak = user.streak + 1
        if ([7, 14, 30, 60, 90].includes(newStreak)) {
          await grantStreakReward(user.id, newStreak)
          streakRewards++
        }
      } catch (e) {
        console.error(`Failed daily bonus for user ${user.id}:`, e)
      }
    }

    // Reset streaks for inactive users
    await prisma.user.updateMany({
      where: {
        lastActiveAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        streak: { gt: 0 },
      },
      data: { streak: 0 },
    })

    console.log(`[Daily bonus cron] Processed ${processed} users, ${streakRewards} streak rewards`)

    return NextResponse.json({
      success: true,
      processed,
      streakRewards,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[/api/cron/daily-bonus]', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
