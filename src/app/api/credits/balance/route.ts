import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        credits: true,
        bonusCredits: true,
        creditsUsed: true,
        plan: true,
        streak: true,
        streakBest: true,
        level: true,
        xp: true,
      },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Recent transactions
    const userFull = await prisma.user.findUnique({ where: { clerkId } })
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: userFull!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      data: {
        credits: user.credits,
        bonusCredits: user.bonusCredits,
        total: user.credits + user.bonusCredits,
        used: user.creditsUsed,
        plan: user.plan,
        streak: user.streak,
        streakBest: user.streakBest,
        level: user.level,
        xp: user.xp,
        transactions,
      },
    })
  } catch (error) {
    console.error('[/api/credits/balance]', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
