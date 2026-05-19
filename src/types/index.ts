// ORVIX — Core TypeScript Types

export type Plan = 'FREE' | 'PRO' | 'ELITE'
export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'LINKEDIN' | 'FACEBOOK'
export type VideoStatus = 'DRAFT' | 'QUEUED' | 'RENDERING' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'FAILED' | 'ARCHIVED'

// ─── User ───────────────────────────────────────
export interface OrvixUser {
  id: string
  clerkId: string
  email: string
  username: string
  displayName?: string
  avatarUrl?: string
  plan: Plan
  credits: number
  bonusCredits: number
  totalViews: number
  totalVideos: number
  streak: number
  level: number
  xp: number
  onboarded: boolean
  createdAt: string
}

// ─── Video ──────────────────────────────────────
export interface Video {
  id: string
  userId: string
  title: string
  description?: string
  prompt?: string
  status: VideoStatus
  renderProgress: number
  viralScore?: number
  hookScore?: number
  estimatedReach?: number
  duration?: number
  aspectRatio: string
  resolution: string
  processedUrl?: string
  thumbnailUrl?: string
  totalViews: number
  tags: string[]
  niche?: string
  language: string
  hasWatermark: boolean
  createdAt: string
  publishedAt?: string
}

// ─── Video Generation ───────────────────────────
export interface GenerateVideoInput {
  prompt: string
  platform?: Platform
  niche?: string
  duration?: number
  voiceProfileId?: string
  captionStyle?: 'cinematic' | 'minimal' | 'bold' | 'none'
  brollStyle?: 'auto' | 'cinematic' | 'documentary'
  resolution?: '720p' | '1080p' | '4k'
  language?: string
  musicTrack?: string
  includeHook?: boolean
  includeCta?: boolean
}

export interface GenerateVideoResponse {
  jobId: string
  estimatedTime: number
  creditsUsed: number
  creditsRemaining: number
  viralScore?: number
  estimatedReach?: number
}

// ─── Script ─────────────────────────────────────
export interface Script {
  id: string
  title: string
  hook?: string
  body: string
  cta?: string
  platform?: Platform
  niche?: string
  wordCount?: number
  estimatedDuration?: number
  viralScore?: number
  createdAt: string
}

export interface GenerateScriptInput {
  topic: string
  platform: Platform
  niche?: string
  framework?: 'hook-story-cta' | 'problem-solution' | 'listicle' | 'tutorial' | 'storytime'
  tone?: 'professional' | 'casual' | 'energetic' | 'calm' | 'authoritative'
  duration?: number
  includeHook?: boolean
  includeCta?: boolean
  keywords?: string[]
}

// ─── Voice ──────────────────────────────────────
export interface VoiceProfile {
  id: string
  name: string
  type: 'PRESET' | 'CLONED' | 'CUSTOM'
  elevenLabsId?: string
  language: string
  gender?: string
  previewUrl?: string
  isDefault: boolean
}

// ─── Credits ────────────────────────────────────
export interface CreditCost {
  action: CreditAction
  cost: number
  description: string
}

export type CreditAction =
  | 'script_generation'
  | 'video_reel_720p'
  | 'video_reel_1080p'
  | 'video_reel_4k'
  | 'hd_export'
  | 'four_k_export'
  | 'viral_analysis'
  | 'voice_clone'
  | 'trend_scan'
  | 'thumbnail_generation'

export const CREDIT_COSTS: Record<CreditAction, CreditCost> = {
  script_generation:    { action: 'script_generation',    cost: 5,  description: 'AI Script Generation' },
  video_reel_720p:      { action: 'video_reel_720p',      cost: 30, description: 'AI Reel (720p)' },
  video_reel_1080p:     { action: 'video_reel_1080p',     cost: 40, description: 'AI Reel (1080p)' },
  video_reel_4k:        { action: 'video_reel_4k',        cost: 80, description: 'AI Reel (4K)' },
  hd_export:            { action: 'hd_export',            cost: 20, description: 'HD Export' },
  four_k_export:        { action: 'four_k_export',        cost: 60, description: '4K Ultra Export' },
  viral_analysis:       { action: 'viral_analysis',       cost: 15, description: 'Viral Score Analysis' },
  voice_clone:          { action: 'voice_clone',          cost: 50, description: 'Voice Clone Session' },
  trend_scan:           { action: 'trend_scan',           cost: 10, description: 'Trend Scanner' },
  thumbnail_generation: { action: 'thumbnail_generation', cost: 8,  description: 'AI Thumbnail' },
}

export const PLAN_CREDITS: Record<Plan, number> = {
  FREE:  50,
  PRO:   2000,
  ELITE: 10000,
}

// ─── Trends ─────────────────────────────────────
export interface TrendItem {
  keyword: string
  platform?: Platform
  viewCount: number
  growth: number
  viralScore: number
  niche?: string
}

// ─── Analytics ──────────────────────────────────
export interface AnalyticsSummary {
  totalViews: number
  totalVideos: number
  avgViralScore: number
  topPlatform: Platform
  viewsGrowth: number
  publishedThisMonth: number
  creditsUsed: number
  creditsRemaining: number
  streak: number
}

export interface VideoPerformance {
  videoId: string
  title: string
  thumbnailUrl?: string
  totalViews: number
  viralScore?: number
  platform: Platform
  publishedAt: string
  watchTime?: number
  ctr?: number
}

// ─── Publishing ──────────────────────────────────
export interface PublishInput {
  videoId: string
  platforms: Platform[]
  caption?: string
  hashtags?: string[]
  scheduledAt?: string
  autoOptimize?: boolean
}

// ─── API Responses ───────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ─── Dashboard ───────────────────────────────────
export interface DashboardStats {
  totalViews: number
  viewsGrowth: number
  viralScore: number
  viralScoreChange: number
  publishedCount: number
  publishedThisWeek: number
  credits: number
  creditsUsed: number
  streak: number
  level: number
}

// ─── Notifications ───────────────────────────────
export interface OrvixNotification {
  id: string
  type: string
  title: string
  body?: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}
