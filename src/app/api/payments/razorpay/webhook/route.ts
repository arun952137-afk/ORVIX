import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { PLAN_CREDITS } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')!

  // Verify signature
  const valid = verifyWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)
  if (!valid) {
    console.error('[Razorpay webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const { event: eventType, payload } = event

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        await handleSubscriptionCharged(payload.subscription.entity, payload.payment?.entity)
        break
      }
      case 'subscription.cancelled':
      case 'subscription.completed': {
        await handleSubscriptionCancelled(payload.subscription.entity)
        break
      }
      case 'payment.captured': {
        await handlePaymentCaptured(payload.payment.entity)
        break
      }
      case 'payment.failed': {
        await handlePaymentFailed(payload.payment.entity)
        break
      }
    }
  } catch (error) {
    console.error('[Razorpay webhook] Handler error:', error)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionCharged(sub: Record<string, unknown>, payment?: Record<string, unknown>) {
  const notes = (sub.notes as Record<string, string>) ?? {}
  const userId = notes.userId
  if (!userId) return

  const planId = sub.plan_id as string
  const plan = planId?.includes('elite') ? 'ELITE' : 'PRO'
  const monthlyCredits = PLAN_CREDITS[plan]

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        credits: monthlyCredits,
      },
    }),
    prisma.subscription.upsert({
      where: { providerId: sub.id as string },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        provider: 'razorpay',
        providerId: sub.id as string,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_GRANT',
        amount: monthlyCredits,
        balance: monthlyCredits,
        description: `${plan} plan monthly credit grant`,
        metadata: { paymentId: payment?.id, subscriptionId: sub.id },
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_RENEWAL',
        title: `${plan} plan activated`,
        body: `${monthlyCredits.toLocaleString()} credits added to your account.`,
      },
    }),
  ])
}

async function handleSubscriptionCancelled(sub: Record<string, unknown>) {
  const notes = (sub.notes as Record<string, string>) ?? {}
  const userId = notes.userId
  if (!userId) return

  await prisma.user.update({
    where: { id: userId },
    data: { plan: 'FREE', planExpiresAt: null },
  })

  await prisma.subscription.updateMany({
    where: { providerId: sub.id as string },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  await prisma.notification.create({
    data: {
      userId,
      type: 'SUBSCRIPTION_RENEWAL',
      title: 'Subscription cancelled',
      body: 'Your subscription has been cancelled. You have been moved to the free plan.',
    },
  })
}

async function handlePaymentCaptured(payment: Record<string, unknown>) {
  // Handle one-time credit pack purchases
  const notes = (payment.notes as Record<string, string>) ?? {}
  if (notes.type !== 'credit_pack') return

  const userId = notes.userId
  const credits = parseInt(notes.credits || '0')
  if (!userId || !credits) return

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bonusCredits: { increment: credits } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount: credits,
        balance: user.credits + user.bonusCredits + credits,
        description: `Credit pack: ${credits} credits`,
        metadata: { paymentId: payment.id, amount: payment.amount },
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `${credits.toLocaleString()} credits added`,
        body: 'Your credit pack purchase was successful.',
      },
    }),
  ])
}

async function handlePaymentFailed(payment: Record<string, unknown>) {
  const notes = (payment.notes as Record<string, string>) ?? {}
  const userId = notes.userId
  if (!userId) return

  await prisma.notification.create({
    data: {
      userId,
      type: 'SYSTEM',
      title: 'Payment failed',
      body: 'Your recent payment failed. Please check your payment method and try again.',
    },
  })
}
