import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Plan price IDs
export const RAZORPAY_PLANS = {
  PRO_MONTHLY: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID!,
  ELITE_MONTHLY: process.env.RAZORPAY_ELITE_MONTHLY_PLAN_ID!,
  PRO_YEARLY: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID!,
  ELITE_YEARLY: process.env.RAZORPAY_ELITE_YEARLY_PLAN_ID!,
}

export const CREDIT_PACKS = {
  STARTER: { credits: 500,  priceINR: 29900,  priceUSD: 499  },
  CREATOR: { credits: 1200, priceINR: 59900,  priceUSD: 999  },
  STUDIO:  { credits: 3000, priceINR: 129900, priceUSD: 1999 },
  EMPIRE:  { credits: 8000, priceINR: 299900, priceUSD: 4999 },
}

export const PLAN_PRICES = {
  PRO:   { monthly: { INR: 83100, USD: 999 },  yearly: { INR: 830000, USD: 9990  } },
  ELITE: { monthly: { INR: 407100, USD: 4999 }, yearly: { INR: 4070000, USD: 49990 } },
}

// Create a subscription
export async function createSubscription(params: {
  planId: string
  customerId?: string
  totalCount?: number
  notes?: Record<string, string>
}): Promise<{ id: string; status: string; shortUrl: string }> {
  const sub = await razorpay.subscriptions.create({
    plan_id: params.planId,
    customer_notify: 1,
    total_count: params.totalCount ?? 120,
    notes: params.notes ?? {},
  })
  return {
    id: sub.id,
    status: sub.status,
    shortUrl: (sub as unknown as Record<string, string>).short_url ?? '',
  }
}

// Create a one-time order (for credit packs)
export async function createOrder(params: {
  amount: number  // in paise (INR) or cents (USD)
  currency: 'INR' | 'USD'
  receipt: string
  notes?: Record<string, string>
}): Promise<{ id: string; amount: number; currency: string }> {
  const order = await razorpay.orders.create({
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    notes: params.notes ?? {},
  })
  return {
    id: order.id,
    amount: order.amount as number,
    currency: order.currency,
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

// Verify payment signature (client-side payment verification)
export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const text = `${params.orderId}|${params.paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex')
  return expectedSignature === params.signature
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string, cancelAtEnd = true): Promise<void> {
  await razorpay.subscriptions.cancel(subscriptionId, cancelAtEnd)
}

// Fetch subscription details
export async function getSubscription(subscriptionId: string) {
  return await razorpay.subscriptions.fetch(subscriptionId)
}
