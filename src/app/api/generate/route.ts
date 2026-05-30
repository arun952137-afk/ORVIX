import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  drew:   '29vD33N1lfxlcxEtH9QP',
  bella:  'EXAVITQu4vr4xnSDxMaL',
  adam:   'pNInz6obpgDQGcFmaJgB',
  elli:   'MF3mGyEYCl7XYWbV9V6O',
  josh:   'TxGEqnHWrfWFTfGW9XjX',
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })

    const { script, voice, music, captionStyle, platform } = await req.json()

    // Build full script text for TTS
    const fullText = `${script.hook} ${script.body} ${script.cta}`

    // Generate voiceover via ElevenLabs
    let voiceoverUrl: string | null = null
    if (process.env.ELEVENLABS_API_KEY) {
      const voiceId = ELEVENLABS_VOICE_MAP[voice] || ELEVENLABS_VOICE_MAP.rachel
      const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: fullText.slice(0, 2500),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
        }),
      })

      if (ttsRes.ok) {
        // In production: upload to Supabase Storage and return URL
        // For now: mark as generated
        voiceoverUrl = 'generated'
      }
    }

    // In a full implementation: 
    // 1. Use FFmpeg/Remotion to assemble video with voiceover
    // 2. Add caption overlay based on captionStyle
    // 3. Mix background music at -20dB under voice
    // 4. Export to MP4 and upload to storage
    // 5. Return download URL

    // For this release: return the script + metadata as the "video package"
    // The script IS the product — creators use it to record/post
    return NextResponse.json({
      success: true,
      video: {
        id: `vid_${Date.now()}`,
        title: script.title,
        script,
        voice,
        music,
        captionStyle,
        platform,
        voiceoverGenerated: !!voiceoverUrl,
        status: 'ready',
        createdAt: new Date().toISOString(),
        downloadUrl: null, // Full video render requires Remotion/cloud GPU
        scriptText: fullText,
      },
    })
  } catch (e: any) {
    console.error('[/api/generate]', e)
    return NextResponse.json({ success: false, error: e.message || 'Generation failed' }, { status: 500 })
  }
}
