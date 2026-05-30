import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })

    const { prompt, platform, tone, duration } = await req.json()
    if (!prompt?.trim()) return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 })

    const platformGuide: Record<string, string> = {
      'TikTok': 'TikTok: fast cuts, trending sounds, hook in first 2s, 15-60s optimal',
      'Instagram Reels': 'Instagram Reels: visual-first, aspirational, 15-90s optimal',
      'YouTube Shorts': 'YouTube Shorts: educational or entertaining, 15-60s optimal',
      'LinkedIn': 'LinkedIn: professional insights, thought leadership, 30-90s',
      'Twitter/X': 'Twitter/X: bold opinion or surprising fact, 15-30s, punchy',
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are an elite viral content strategist who has helped creators get 100M+ views.
Generate a ${duration}-second video script optimised for ${platform}.
Platform guide: ${platformGuide[platform] || platformGuide['TikTok']}
Tone: ${tone}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "compelling video title",
  "hook": "the opening 2-3 sentence hook that stops the scroll",
  "body": "the full spoken script body (natural, conversational, no stage directions)",
  "cta": "the final call-to-action",
  "viralScore": 82-99,
  "hookScore": 80-99,
  "estimatedReach": "e.g. 120K-480K",
  "duration": ${duration},
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "platform": "${platform}"
}`,
      messages: [{ role: 'user', content: `Create a viral video script about: "${prompt}"` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const script = JSON.parse(clean)

    return NextResponse.json({ success: true, script })
  } catch (e: any) {
    console.error('[/api/script]', e)
    // Fallback script if Claude API fails
    if (e.message?.includes('credit') || e.message?.includes('billing') || e.status === 529) {
      return NextResponse.json({ success: false, error: 'AI credits needed — add billing at console.anthropic.com' }, { status: 402 })
    }
    return NextResponse.json({ success: false, error: e.message || 'Script generation failed' }, { status: 500 })
  }
}
