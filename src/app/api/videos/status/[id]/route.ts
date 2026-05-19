import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getJobProgress } from '@/lib/queue'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: videoId } = await params

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const video = await prisma.video.findFirst({
      where: { id: videoId, userId: user.id },
      include: {
        publishedPosts: { select: { platform: true, status: true, url: true, views: true } },
      },
    })

    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    // Get queue job progress if still rendering
    let queueProgress = null
    if (video.status === 'QUEUED' || video.status === 'RENDERING') {
      queueProgress = await getJobProgress(`video-${videoId}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...video,
        queueProgress,
      },
    })
  } catch (error) {
    console.error('[/api/videos/status]', error)
    return NextResponse.json({ error: 'Failed to fetch video status' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: videoId } = await params
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.video.deleteMany({ where: { id: videoId, userId: user.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[/api/videos/status DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
