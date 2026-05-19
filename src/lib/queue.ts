import { Queue, Worker, QueueEvents } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
}

// ── VIDEO RENDER QUEUE ──────────────────────────────
export const videoQueue = new Queue('video-render', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})

export interface VideoRenderJob {
  videoId: string
  userId: string
  script: {
    hook: string
    body: string
    cta: string
    title: string
  }
  config: {
    platform: string
    resolution: string
    voiceProfileId?: string
    captionStyle?: string
    brollStyle?: string
    musicTrack?: string
    language: string
    duration: number
  }
}

export async function queueVideoRender(job: VideoRenderJob): Promise<string> {
  const result = await videoQueue.add('render', job, {
    priority: job.config.resolution === '4k' ? 5 : 10,
    jobId: `video-${job.videoId}`,
  })
  return result.id!
}

export async function getJobProgress(jobId: string): Promise<{
  status: string
  progress: number
  result?: unknown
  error?: string
}> {
  const job = await videoQueue.getJob(jobId)
  if (!job) return { status: 'not_found', progress: 0 }

  const state = await job.getState()
  return {
    status: state,
    progress: typeof job.progress === 'number' ? job.progress : 0,
    result: job.returnvalue,
    error: job.failedReason,
  }
}

// ── PUBLISH QUEUE ──────────────────────────────────
export const publishQueue = new Queue('social-publish', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 200 },
  },
})

export interface PublishJob {
  videoId: string
  userId: string
  platforms: string[]
  caption: string
  hashtags: string[]
  scheduledAt?: string
}

export async function queuePublish(job: PublishJob): Promise<string> {
  const delay = job.scheduledAt
    ? Math.max(0, new Date(job.scheduledAt).getTime() - Date.now())
    : 0

  const result = await publishQueue.add('publish', job, { delay })
  return result.id!
}

// ── EMAIL QUEUE ────────────────────────────────────
export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: { count: 50 } },
})

export async function queueEmail(to: string, subject: string, html: string): Promise<void> {
  await emailQueue.add('send', { to, subject, html })
}
