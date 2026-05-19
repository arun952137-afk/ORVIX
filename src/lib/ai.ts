// ORVIX — AI Services Layer
// Orchestrates OpenAI, Claude, Gemini, ElevenLabs

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import type { GenerateScriptInput, GenerateVideoInput, Platform } from '@/types'

// ─── Clients ──────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Script Generation ─────────────────────────────────────────
export async function generateScript(input: GenerateScriptInput): Promise<{
  hook: string
  body: string
  cta: string
  title: string
  wordCount: number
  estimatedDuration: number
  viralScore: number
  hookScore: number
}> {
  const platformGuides: Record<Platform, string> = {
    TIKTOK:    'TikTok: 15-60 seconds, instant hook, energetic, trendy, direct-to-camera',
    INSTAGRAM: 'Instagram Reels: 15-90 seconds, visual storytelling, aspirational, aesthetic',
    YOUTUBE:   'YouTube Shorts: 15-60 seconds, educational or entertainment, clear value prop',
    TWITTER:   'Twitter/X: 15-30 seconds, opinion-led, controversial take, conversation starter',
    LINKEDIN:  'LinkedIn Video: 30-90 seconds, professional insights, career/business focused',
    FACEBOOK:  'Facebook: 30-120 seconds, broad appeal, emotional storytelling',
  }

  const frameworkGuides: Record<string, string> = {
    'hook-story-cta': 'Hook (2-3 sec) → Story/Value (main) → Clear CTA (final 3 sec)',
    'problem-solution': 'Pain Point → Agitate → Solution → Result → CTA',
    'listicle': 'Numbered list format: "5 ways to..." with each point being punchy and visual',
    'tutorial': 'Show don\'t tell → Step by step → Before/after result',
    'storytime': 'Personal story → Lesson → Application → Inspire',
  }

  const systemPrompt = `You are an elite viral content strategist with 10+ years creating content that generates hundreds of millions of views. You know exactly what makes content go viral on every platform.

Platform context: ${platformGuides[input.platform]}
Script framework: ${frameworkGuides[input.framework || 'hook-story-cta']}
Tone: ${input.tone || 'energetic'}

Rules:
- The HOOK must be in the first 3 seconds — it must stop the scroll instantly
- Use conversational, natural language — not corporate or stiff
- Include pattern interrupts to maintain attention
- Every sentence must earn its place
- The CTA must feel natural, not salesy

Respond ONLY with valid JSON, no markdown, no explanation:`

  const userPrompt = `Generate a viral video script for: "${input.topic}"
Target: ${input.platform} ${input.niche ? `| Niche: ${input.niche}` : ''}
Target duration: ${input.duration || 60} seconds

Return JSON with:
{
  "title": "catchy video title",
  "hook": "the opening 3 seconds verbatim (make it STOP THE SCROLL)",
  "body": "main content body (paragraphs for TTS)",
  "cta": "closing call to action",
  "wordCount": number,
  "estimatedDuration": seconds,
  "viralScore": 0-100,
  "hookScore": 0-100
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    // Fallback structure
    return {
      title: input.topic,
      hook: `Wait — you need to know this about ${input.topic}`,
      body: text,
      cta: 'Follow for more like this',
      wordCount: text.split(' ').length,
      estimatedDuration: input.duration || 60,
      viralScore: 75,
      hookScore: 80,
    }
  }
}

// ─── Hook Generation ───────────────────────────────────────────
export async function generateHooks(topic: string, count = 5): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a viral hook specialist. Generate scroll-stopping opening lines for short-form video. Return ONLY a JSON array of strings.',
      },
      {
        role: 'user',
        content: `Generate ${count} different viral hooks for: "${topic}". Mix styles: question, bold claim, number, story opener, controversy. Return as JSON array.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 500,
  })

  const text = response.choices[0].message.content || '[]'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return [text]
  }
}

// ─── Viral Score Analysis ──────────────────────────────────────
export async function analyzeViralPotential(params: {
  title: string
  hook: string
  body: string
  platform: Platform
  niche?: string
}): Promise<{
  viralScore: number
  hookScore: number
  retentionScore: number
  estimatedReach: { low: number; high: number }
  suggestions: string[]
  strengths: string[]
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a viral content AI analyst with access to performance data from billions of videos. Analyze content and predict virality with precision. Return only JSON.`,
      },
      {
        role: 'user',
        content: `Analyze this ${params.platform} video for viral potential:

TITLE: ${params.title}
HOOK: ${params.hook}
BODY: ${params.body.slice(0, 500)}
NICHE: ${params.niche || 'general'}

Return JSON:
{
  "viralScore": 0-100,
  "hookScore": 0-100,
  "retentionScore": 0-100,
  "estimatedReach": { "low": number, "high": number },
  "suggestions": ["improvement 1", "improvement 2", "improvement 3"],
  "strengths": ["strength 1", "strength 2"]
}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  })

  const text = response.choices[0].message.content || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return {
      viralScore: 75,
      hookScore: 80,
      retentionScore: 70,
      estimatedReach: { low: 50000, high: 200000 },
      suggestions: ['Strengthen the hook', 'Add more pattern interrupts', 'Make CTA more specific'],
      strengths: ['Good topic selection', 'Clear value proposition'],
    }
  }
}

// ─── Trend Scanning ────────────────────────────────────────────
export async function scanTrends(niche: string, platform: Platform): Promise<Array<{
  keyword: string
  angle: string
  viralScore: number
  difficulty: 'low' | 'medium' | 'high'
  urgency: 'breaking' | 'rising' | 'established'
}>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a viral trend analyst for ${platform}. Identify current trending topics and content opportunities. Return only JSON.`,
      },
      {
        role: 'user',
        content: `What are the top 8 trending content opportunities in the ${niche} niche on ${platform} right now? Consider current events, emerging topics, and underserved angles.

Return JSON array:
[{
  "keyword": "topic",
  "angle": "specific content angle to take",
  "viralScore": 0-100,
  "difficulty": "low|medium|high",
  "urgency": "breaking|rising|established"
}]`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const text = response.choices[0].message.content || '[]'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return []
  }
}

// ─── Voice Generation (ElevenLabs) ────────────────────────────
export async function generateVoiceOver(params: {
  text: string
  voiceId: string
  stability?: number
  similarityBoost?: number
  style?: number
}): Promise<Buffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${params.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: params.text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: params.stability ?? 0.5,
          similarity_boost: params.similarityBoost ?? 0.75,
          style: params.style ?? 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ─── Voice Cloning ─────────────────────────────────────────────
export async function cloneVoice(params: {
  name: string
  audioSamples: Buffer[]
  description?: string
}): Promise<{ voiceId: string; name: string }> {
  const formData = new FormData()
  formData.append('name', params.name)
  if (params.description) formData.append('description', params.description)

  params.audioSamples.forEach((sample, i) => {
    const blob = new Blob([sample], { type: 'audio/mp3' })
    formData.append('files', blob, `sample_${i}.mp3`)
  })

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
    body: formData,
  })

  if (!response.ok) throw new Error('Voice cloning failed')

  const data = await response.json()
  return { voiceId: data.voice_id, name: params.name }
}

// ─── Thumbnail Generation ──────────────────────────────────────
export async function generateThumbnail(params: {
  title: string
  style: 'cinematic' | 'bold' | 'minimal'
  niche?: string
}): Promise<string> {
  const styleGuides = {
    cinematic: 'dramatic lighting, film noir aesthetic, moody shadows, high contrast, professional photography style',
    bold: 'bright colors, large text overlay space, high energy, eye-catching, YouTube thumbnail style',
    minimal: 'clean white background, minimal design, elegant typography space, professional',
  }

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Professional YouTube/TikTok thumbnail for "${params.title}". Style: ${styleGuides[params.style]}. ${params.niche ? `Niche: ${params.niche}.` : ''} High quality, photorealistic, no text.`,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
    style: 'vivid',
  })

  return response.data[0].url || ''
}

// ─── AI Caption Generation ─────────────────────────────────────
export async function generateCaptions(params: {
  audioUrl: string
  language?: string
  style?: 'standard' | 'cinematic' | 'karaoke'
}): Promise<Array<{
  start: number
  end: number
  text: string
  words?: Array<{ start: number; end: number; word: string }>
}>> {
  // Uses AssemblyAI for accurate transcription
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'authorization': process.env.ASSEMBLYAI_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: params.audioUrl }),
  })
  const { upload_url } = await uploadResponse.json()

  const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': process.env.ASSEMBLYAI_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: upload_url || params.audioUrl,
      language_code: params.language || 'en',
      word_boost: [],
      boost_param: 'high',
    }),
  })
  const { id } = await transcriptResponse.json()

  // Poll for completion
  let transcript: Record<string, unknown> = {}
  while (transcript.status !== 'completed' && transcript.status !== 'error') {
    await new Promise((r) => setTimeout(r, 2000))
    const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY! },
    })
    transcript = await poll.json()
  }

  if (transcript.status === 'error') throw new Error('Transcription failed')

  // Format into caption segments
  const words = (transcript.words as Array<{ start: number; end: number; text: string }>) || []
  const segments: Array<{ start: number; end: number; text: string }> = []
  let currentSegment: typeof segments[0] | null = null

  words.forEach((word) => {
    if (!currentSegment) {
      currentSegment = { start: word.start / 1000, end: word.end / 1000, text: word.text }
    } else if (
      currentSegment.text.split(' ').length < 7 &&
      word.start / 1000 - currentSegment.end < 0.5
    ) {
      currentSegment.text += ' ' + word.text
      currentSegment.end = word.end / 1000
    } else {
      segments.push(currentSegment)
      currentSegment = { start: word.start / 1000, end: word.end / 1000, text: word.text }
    }
  })
  if (currentSegment) segments.push(currentSegment)

  return segments
}

// ─── Competitor Analysis ───────────────────────────────────────
export async function analyzeCompetitorContent(params: {
  niche: string
  platform: Platform
  topicFocus?: string
}): Promise<{
  gaps: string[]
  opportunities: string[]
  saturated: string[]
  recommendations: string[]
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: 'You are a content strategy expert specializing in competitive analysis for short-form video creators. Return only JSON.',
    messages: [{
      role: 'user',
      content: `Analyze the competitive landscape for ${params.platform} in the ${params.niche} niche.
${params.topicFocus ? `Focus area: ${params.topicFocus}` : ''}

Return JSON:
{
  "gaps": ["underserved content angles"],
  "opportunities": ["high potential topics with low competition"],
  "saturated": ["oversaturated topics to avoid"],
  "recommendations": ["strategic content recommendations"]
}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { gaps: [], opportunities: [], saturated: [], recommendations: [] }
  }
}
