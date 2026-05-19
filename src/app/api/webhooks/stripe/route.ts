// ORVIX — Stripe Webhook Handler
// POST /api/webhooks/stripe

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { PLAN_CREDITS } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

const PRICE_TO_PLAN: Record<string, 'PRO' | 'ELITE'> = {
  [process.env.STRIPE_PRO_PRICE_ID!]:   'PRO',
  [process.env.STRIPE_ELITE_PRICE_ID!]: 'ELITE',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }
  } catch (error) {
    console.error('[Stripe webhook] Handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.CheckoutSession) {
  const { metadata, customer, subscription: subId } = session
  if (!metadata?.userId || !subId) return

  const user = await prisma.user.findUnique({ where: { id: metadata.userId } })
  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer as string },
  })
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  const customerId = sub.customer as string
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (!user) return

  const priceId = sub.items.data[0]?.price.id
  const plan = PRICE_TO_PLAN[priceId] || 'FREE'
  const monthlyCredits = PLAN_CREDITS[plan]

  // Update user plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      planExpiresAt: new Date(sub.current_period_end * 1000),
    },
  })

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { providerId: sub.id },
    create: {
      userId: user.id,
      plan,
      status: sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
      provider: 'stripe',
      providerId: sub.id,
      priceId,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      plan,
      status: sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  })

  // Grant monthly credits on renewal
  if (sub.status === 'active') {
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: monthlyCredits },
    })

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_GRANT',
        amount: monthlyCredits,
        balance: monthlyCredits,
        description: `${plan} plan monthly credit grant`,
      },
    })

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SUBSCRIPTION_RENEWAL',
        title: `${plan} plan renewed`,
        body: `${monthlyCredits.toLocaleString()} credits have been added to your account.`,
      },
    })
  }
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  const customerId = sub.customer as string
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (!user) return

  await prisma.user.update({
    where: { id: user.id },
    data: { plan: 'FREE', planExpiresAt: null },
  })

  await prisma.subscription.update({
    where: { providerId: sub.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SUBSCRIPTION_RENEWAL',
      title: 'Subscription cancelled',
      body: 'Your subscription has been cancelled. You still have access until the end of your billing period.',
    },
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle one-time credit pack purchases
  if (invoice.metadata?.type === 'credit_pack') {
    const customerId = invoice.customer as string
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
    if (!user) return

    const credits = parseInt(invoice.metadata.credits || '0')
    await prisma.user.update({
      where: { id: user.id },
      data: { bonusCredits: { increment: credits } },
    })

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'PURCHASE',
        amount: credits,
        balance: user.credits + user.bonusCredits + credits,
        description: `Credit pack purchase: ${credits} credits`,
        metadata: { invoiceId: invoice.id, amount: invoice.amount_paid },
      },
    })
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (!user) return

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SYSTEM',
      title: 'Payment failed',
      body: 'Your recent payment failed. Please update your payment method to avoid service interruption.',
    },
  })
}
