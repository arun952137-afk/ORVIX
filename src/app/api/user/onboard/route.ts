import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const OnboardSchema = z.object({
  niche: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  goal: z.string().min(1),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
})

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const input = OnboardSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check username uniqueness
    const existingUsername = await prisma.user.findFirst({
      where: { username: input.username, NOT: { id: user.id } },
    })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: input.username,
        onboarded: true,
        xp: { increment: 100 }, // Welcome XP
      },
    })

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Welcome to ORVIX! 🎉',
        body: `You've earned 100 XP and entered the universe as ${input.username}. You start as a Seed Creator — time to rise.`,
      },
    })

    return NextResponse.json({ success: true, data: { username: input.username } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('[/api/user/onboard]', error)
    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 })
  }
}
