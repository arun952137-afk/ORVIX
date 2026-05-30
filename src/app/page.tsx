import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      {/* Logo */}
      <div style={{ fontFamily: 'system-ui', fontSize: 11, fontWeight: 900, letterSpacing: '.4em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 48 }}>ORVIX</div>

      {/* Hero */}
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(48px,7vw,88px)', fontWeight: 400, letterSpacing: '-.03em', lineHeight: .9, color: 'var(--ivory)', marginBottom: 24, maxWidth: 700 }}>
        Type a prompt.<br />
        <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Get a viral video.</em>
      </h1>

      <p style={{ fontSize: 16, color: 'var(--fog)', lineHeight: 1.8, maxWidth: 480, marginBottom: 48 }}>
        ORVIX writes your script, generates AI voiceover, picks trending music, and assembles your reel — in under 60 seconds.
      </p>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/sign-up" className="btn btn-primary" style={{ fontSize: 13, padding: '14px 32px' }}>
          Start Creating Free →
        </Link>
        <Link href="/sign-in" className="btn btn-ghost" style={{ fontSize: 13, padding: '14px 24px' }}>
          Sign In
        </Link>
      </div>

      {/* Features strip */}
      <div style={{ marginTop: 80, display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '✦', label: 'AI Script Writer', desc: 'Claude generates viral hooks & scripts' },
          { icon: '◉', label: 'Voice Synthesis', desc: '500+ AI voices via ElevenLabs' },
          { icon: '◈', label: 'Music & Editing', desc: 'Auto-matched trending tracks' },
          { icon: '⬡', label: 'Viral Predictor', desc: 'Score before you post' },
        ].map(f => (
          <div key={f.label} style={{ textAlign: 'center', maxWidth: 160 }}>
            <div style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ivory)', marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: 'var(--fog)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div style={{ marginTop: 64, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.2em', color: 'var(--iron)', textTransform: 'uppercase' }}>
        Powered by Claude · OpenAI · ElevenLabs · Razorpay
      </div>
    </main>
  )
}
