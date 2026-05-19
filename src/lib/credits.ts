// ORVIX — Credits System
import { prisma } from './prisma'
import type { CreditAction, Plan } from '@/types'
import { CREDIT_COSTS, PLAN_CREDITS } from '@/types'

export async function deductCredits(params: {
  userId: string
  amount: number
  action: CreditAction
  videoId?: string
}) {
  const user = await prisma.user.findUnique({ where: { id: params.userId } })
  if (!user) throw new Error('User not found')

  const total = user.credits + user.bonusCredits
  if (total < params.amount) throw new Error('Insufficient credits')

  let newCredits = user.credits
  let newBonus = user.bonusCredits

  // Deduct from bonus first
  if (newBonus >= params.amount) {
    newBonus -= params.amount
  } else {
    const remainder = params.amount - newBonus
    newBonus = 0
    newCredits -= remainder
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: params.userId },
      data: { credits: newCredits, bonusCredits: newBonus, creditsUsed: { increment: params.amount } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId: params.userId,
        type: actionToCreditTxType(params.action),
        amount: -params.amount,
        balance: newCredits + newBonus,
        description: CREDIT_COSTS[params.action].description,
        videoId: params.videoId,
      },
    }),
  ])

  // Notify if credits are low
  if (newCredits + newBonus < 50 && newCredits + newBonus >= 0) {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: 'CREDITS_LOW',
        title: 'Credits running low',
        body: `You have ${newCredits + newBonus} credits remaining. Top up to keep creating.`,
      },
    }).catch(() => {})
  }

  return { credits: newCredits, bonusCredits: newBonus }
}

export async function grantDailyBonus(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return 0

  const bonusAmount = getDailyBonusAmount(user.plan as Plan, user.streak)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        bonusCredits: { increment: bonusAmount },
        streak: { increment: 1 },
        streakBest: user.streak + 1 > user.streakBest ? user.streak + 1 : user.streakBest,
        lastActiveAt: new Date(),
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'DAILY_BONUS',
        amount: bonusAmount,
        balance: user.credits + user.bonusCredits + bonusAmount,
        description: `Daily bonus credits (Day ${user.streak + 1} streak)`,
      },
    }),
  ])

  return bonusAmount
}

export async function grantStreakReward(userId: string, streakDays: number): Promise<number> {
  const rewards: Record<number, number> = { 7: 100, 14: 250, 30: 500, 60: 1000, 90: 2000 }
  const reward = rewards[streakDays] || 0
  if (!reward) return 0

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return 0

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bonusCredits: { increment: reward } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'STREAK_REWARD',
        amount: reward,
        balance: user.credits + user.bonusCredits + reward,
        description: `${streakDays}-day streak reward`,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: `${streakDays}-day streak! 🔥`,
        body: `You've earned ${reward} bonus credits for your ${streakDays}-day creation streak.`,
      },
    }),
  ])

  return reward
}

export async function grantReferralBonus(userId: string, referredUserId: string): Promise<void> {
  const REFERRAL_BONUS = 200

  await prisma.$transaction(async (tx) => {
    const [user] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
    ])
    if (!user) return

    await tx.user.update({
      where: { id: userId },
      data: { bonusCredits: { increment: REFERRAL_BONUS } },
    })

    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'REFERRAL_BONUS',
        amount: REFERRAL_BONUS,
        balance: user.credits + user.bonusCredits + REFERRAL_BONUS,
        description: `Referral bonus for inviting a new creator`,
        metadata: { referredUserId },
      },
    })
  })
}

function getDailyBonusAmount(plan: Plan, streak: number): number {
  const base = { FREE: 2, PRO: 10, ELITE: 30 }[plan]
  const streakMultiplier = streak >= 30 ? 2 : streak >= 14 ? 1.5 : streak >= 7 ? 1.25 : 1
  return Math.floor(base * streakMultiplier)
}

function actionToCreditTxType(action: CreditAction) {
  const map: Record<CreditAction, string> = {
    script_generation:    'SCRIPT_GENERATION',
    video_reel_720p:      'VIDEO_GENERATION',
    video_reel_1080p:     'VIDEO_GENERATION',
    video_reel_4k:        'VIDEO_GENERATION',
    hd_export:            'HD_EXPORT',
    four_k_export:        'FOUR_K_EXPORT',
    viral_analysis:       'VIRAL_ANALYSIS',
    voice_clone:          'VOICE_CLONE',
    trend_scan:           'SCRIPT_GENERATION',
    thumbnail_generation: 'SCRIPT_GENERATION',
  }
  return map[action] as Parameters<typeof prisma.creditTransaction.create>[0]['data']['type']
}

// ─── Prisma client singleton ──────────────────────────────────
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
