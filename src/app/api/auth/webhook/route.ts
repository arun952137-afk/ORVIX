import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PLAN_CREDITS } from '@/types'

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })

  const svix_id = request.headers.get('svix-id')
  const svix_timestamp = request.headers.get('svix-timestamp')
  const svix_signature = request.headers.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await request.text()

  let event: WebhookEvent
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, username, first_name, last_name, image_url } = event.data
        const email = email_addresses[0]?.email_address
        if (!email) break

        const generatedUsername = username || `creator_${id.slice(-8)}`

        await prisma.user.upsert({
          where: { clerkId: id },
          create: {
            clerkId: id,
            email,
            username: generatedUsername,
            displayName: [first_name, last_name].filter(Boolean).join(' ') || generatedUsername,
            avatarUrl: image_url,
            plan: 'FREE',
            credits: PLAN_CREDITS.FREE,
            workspace: {
              create: {
                name: `${generatedUsername}'s Workspace`,
                slug: generatedUsername,
              },
            },
          },
          update: {
            email,
            avatarUrl: image_url,
          },
        })
        break
      }

      case 'user.updated': {
        const { id, email_addresses, username, first_name, last_name, image_url } = event.data
        const email = email_addresses[0]?.email_address

        await prisma.user.updateMany({
          where: { clerkId: id },
          data: {
            ...(email && { email }),
            ...(username && { username }),
            displayName: [first_name, last_name].filter(Boolean).join(' ') || undefined,
            avatarUrl: image_url,
          },
        })
        break
      }

      case 'user.deleted': {
        const { id } = event.data
        if (id) {
          await prisma.user.deleteMany({ where: { clerkId: id } })
        }
        break
      }
    }
  } catch (error) {
    console.error('[Clerk webhook] Error:', error)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
