import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import Anthropic from '@anthropic-ai/sdk'

const FALLBACK = [
  { topic:'AI tools replacing jobs', angle:'What you need to know', viralScore:97, urgency:'breaking', hooks:['The job market just changed forever','This AI replaces your role in 6 months'] },
  { topic:'Passive income 2025', angle:'Realistic methods only', viralScore:94, urgency:'rising', hooks:['I made $8K while I slept','Stop trading time for money'] },
  { topic:'Morning routine hack', angle:'5-minute version', viralScore:91, urgency:'steady', hooks:['I added 2 hours to my day','The routine top performers swear by'] },
  { topic:'ChatGPT secret prompts', angle:'That nobody shares', viralScore:89, urgency:'rising', hooks:['Save these before they disappear','This prompt made me $1,000'] },
  { topic:'Side hustle that actually works', angle:'From someone who tried 20', viralScore:85, urgency:'steady', hooks:['I wasted 2 years on wrong ones','This one needs zero investment'] },
  { topic:'AI video creation tools', angle:'Free vs paid breakdown', viralScore:88, urgency:'rising', hooks:['Stop paying for tools you don\'t need','These 3 free AI tools do everything'] },
]

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })

  const niche = req.nextUrl.searchParams.get('niche') || 'AI & Technology'

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ success: true, trends: FALLBACK, niche })
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: 'Return only valid JSON array, no markdown.',
      messages: [{ role:'user', content:`Top 6 trending video topics in "${niche}" right now. Return: [{"topic":"...","angle":"...","viralScore":82-99,"urgency":"breaking|rising|steady","hooks":["hook1","hook2"]}]` }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const trends = JSON.parse(text.replace(/```json|```/g,'').trim())
    return NextResponse.json({ success: true, trends, niche })
  } catch {
    return NextResponse.json({ success: true, trends: FALLBACK, niche })
  }
}
