import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createOrder, createSubscription, CREDIT_PACKS, RAZORPAY_PLANS } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'

const OrderSchema = z.object({
  type: z.enum(['subscription', 'credit_pack']),
  plan: z.enum(['PRO', 'ELITE']).optional(),
  pack: z.enum(['STARTER', 'CREATOR', 'STUDIO', 'EMPIRE']).optional(),
  currency: z.enum(['INR', 'USD']).default('INR'),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await request.json()
    const input = OrderSchema.parse(body)

    if (input.type === 'subscription' && input.plan) {
      // Create Razorpay subscription
      const planKey = `${input.plan}_${input.interval.toUpperCase()}` as keyof typeof RAZORPAY_PLANS
      const planId = RAZORPAY_PLANS[planKey]

      const sub = await createSubscription({
        planId,
        notes: { userId: user.id, plan: input.plan, userEmail: user.email },
      })

      return NextResponse.json({
        success: true,
        data: {
          type: 'subscription',
          subscriptionId: sub.id,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          name: 'ORVIX',
          description: `ORVIX ${input.plan} Plan`,
          prefill: { email: user.email, name: user.displayName || user.username },
          theme: { color: '#c29a40' },
        },
      })
    }

    if (input.type === 'credit_pack' && input.pack) {
      const pack = CREDIT_PACKS[input.pack]
      const amount = input.currency === 'INR' ? pack.priceINR : pack.priceUSD

      const order = await createOrder({
        amount,
        currency: input.currency,
        receipt: `credits_${user.id}_${Date.now()}`,
        notes: {
          userId: user.id,
          type: 'credit_pack',
          pack: input.pack,
          credits: pack.credits.toString(),
          userEmail: user.email,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          type: 'order',
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          name: 'ORVIX',
          description: `${pack.credits.toLocaleString()} Credits Pack`,
          prefill: { email: user.email, name: user.displayName || user.username },
          theme: { color: '#c29a40' },
          credits: pack.credits,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
  } catch (error) {
    console.error('[/api/payments/create-order]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
