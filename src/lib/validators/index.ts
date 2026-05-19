import { z } from 'zod'

export const VideoGenerateSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(500),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK']).default('TIKTOK'),
  niche: z.string().optional(),
  duration: z.number().min(15).max(180).default(60),
  voiceProfileId: z.string().optional(),
  resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
  captionStyle: z.enum(['cinematic', 'minimal', 'bold', 'none']).default('cinematic'),
  brollStyle: z.enum(['auto', 'cinematic', 'documentary']).default('auto'),
  language: z.string().default('en'),
  musicTrack: z.string().optional(),
  includeHook: z.boolean().default(true),
  includeCta: z.boolean().default(true),
})

export const ScriptGenerateSchema = z.object({
  topic: z.string().min(3).max(300),
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK']).default('TIKTOK'),
  niche: z.string().optional(),
  framework: z.enum(['hook-story-cta', 'problem-solution', 'listicle', 'tutorial', 'storytime']).default('hook-story-cta'),
  tone: z.enum(['professional', 'casual', 'energetic', 'calm', 'authoritative']).default('energetic'),
  duration: z.number().min(15).max(180).default(60),
})

export const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(300).optional(),
  website: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
})

export const PublishSchema = z.object({
  videoId: z.string().cuid(),
  platforms: z.array(z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'FACEBOOK'])).min(1),
  caption: z.string().max(2200).optional(),
  hashtags: z.array(z.string()).max(30).optional(),
  scheduledAt: z.string().datetime().optional(),
  autoOptimize: z.boolean().default(true),
})

export const OnboardSchema = z.object({
  niche: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  goal: z.string().min(1),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
})

export const PaymentOrderSchema = z.object({
  type: z.enum(['subscription', 'credit_pack']),
  plan: z.enum(['PRO', 'ELITE']).optional(),
  pack: z.enum(['STARTER', 'CREATOR', 'STUDIO', 'EMPIRE']).optional(),
  currency: z.enum(['INR', 'USD']).default('INR'),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})
