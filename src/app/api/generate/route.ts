import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })

  const { script, voice, music, captionStyle, platform } = await req.json()

  let voiceoverGenerated = false
  if (process.env.ELEVENLABS_API_KEY) {
    const VOICE_MAP: Record<string,string> = {
      rachel: '21m00Tcm4TlvDq8ikWAM', drew: '29vD33N1lfxlcxEtH9QP',
      bella: 'EXAVITQu4vr4xnSDxMaL', adam: 'pNInz6obpgDQGcFmaJgB',
      elli: 'MF3mGyEYCl7XYWbV9V6O', josh: 'TxGEqnHWrfWFTfGW9XjX',
    }
    const voiceId = VOICE_MAP[voice] || VOICE_MAP.rachel
    const fullText = `${script.hook} ${script.body} ${script.cta}`
    try {
      const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        body: JSON.stringify({ text: fullText.slice(0,2500), model_id: 'eleven_turbo_v2_5', voice_settings: { stability:0.5, similarity_boost:0.75 } }),
      })
      voiceoverGenerated = ttsRes.ok
    } catch {}
  }

  return NextResponse.json({
    success: true,
    video: {
      id: `vid_${Date.now()}`,
      title: script.title,
      script, voice, music, captionStyle, platform,
      voiceoverGenerated,
      status: 'ready',
      createdAt: new Date().toISOString(),
    },
  })
}
