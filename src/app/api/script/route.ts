import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })

  const { prompt, platform, tone, duration } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const platformGuide: Record<string,string> = {
    'TikTok': 'TikTok: fast, hook in 2s, 15-60s optimal',
    'Instagram Reels': 'Instagram Reels: visual-first, aspirational, 15-90s',
    'YouTube Shorts': 'YouTube Shorts: educational or entertaining, 15-60s',
    'LinkedIn': 'LinkedIn: professional insights, 30-90s',
    'Twitter/X': 'Twitter/X: bold opinion, 15-30s, punchy',
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are an elite viral content strategist. Generate a ${duration}-second video script for ${platform}.
Platform: ${platformGuide[platform] || platformGuide['TikTok']}
Tone: ${tone}
Return ONLY valid JSON (no markdown):
{
  "title": "compelling title",
  "hook": "opening 2-3 sentence hook that stops the scroll",
  "body": "full spoken script body, natural and conversational",
  "cta": "final call-to-action",
  "viralScore": 82-99,
  "hookScore": 80-99,
  "estimatedReach": "e.g. 120K-480K",
  "duration": ${duration},
  "hashtags": ["tag1","tag2","tag3","tag4","tag5"],
  "platform": "${platform}"
}`,
      messages: [{ role: 'user', content: `Create a viral video script about: "${prompt}"` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const script = JSON.parse(text.replace(/```json|```/g,'').trim())
    return NextResponse.json({ success: true, script })
  } catch (e: any) {
    console.error('[/api/script]', e?.message)
    if (e?.status === 529 || e?.message?.includes('credit') || e?.message?.includes('overload')) {
      return NextResponse.json({ success: false, error: 'AI service temporarily busy. Please try again in a moment.' }, { status: 503 })
    }
    return NextResponse.json({ success: false, error: 'Script generation failed: ' + (e?.message || 'Unknown error') }, { status: 500 })
  }
}
