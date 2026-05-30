'use client'
import { useState } from 'react'

type Step = 'prompt' | 'script' | 'voice' | 'render' | 'done'

interface ScriptData {
  title: string
  hook: string
  body: string
  cta: string
  viralScore: number
  hookScore: number
  estimatedReach: string
  duration: number
  hashtags: string[]
  platform: string
}

const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'LinkedIn', 'Twitter/X']
const TONES = ['Energetic', 'Professional', 'Casual', 'Inspiring', 'Educational', 'Funny']
const VOICES = [
  { id: 'rachel', name: 'Rachel', desc: 'Warm, American female' },
  { id: 'drew', name: 'Drew', desc: 'Deep, authoritative male' },
  { id: 'bella', name: 'Bella', desc: 'Young, enthusiastic female' },
  { id: 'adam', name: 'Adam', desc: 'Calm, British male' },
  { id: 'elli', name: 'Elli', desc: 'Bright, upbeat female' },
  { id: 'josh', name: 'Josh', desc: 'Energetic, American male' },
]
const MUSIC_STYLES = ['None', 'Upbeat Pop', 'Cinematic', 'Lo-fi Chill', 'Hip-Hop', 'Electronic', 'Acoustic']

export function VideoCreator() {
  const [step, setStep] = useState<Step>('prompt')
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [tone, setTone] = useState('Energetic')
  const [duration, setDuration] = useState(60)
  const [script, setScript] = useState<ScriptData | null>(null)
  const [voice, setVoice] = useState('rachel')
  const [music, setMusic] = useState('Upbeat Pop')
  const [captionStyle, setCaptionStyle] = useState('Bold')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [renderProgress, setRenderProgress] = useState(0)
  const [editingScript, setEditingScript] = useState(false)
  const [editHook, setEditHook] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editCta, setEditCta] = useState('')

  const STEPS = [
    { id: 'prompt', label: 'Prompt' },
    { id: 'script', label: 'Script' },
    { id: 'voice', label: 'Voice & Music' },
    { id: 'render', label: 'Rendering' },
    { id: 'done', label: 'Done' },
  ]
  const stepIdx = STEPS.findIndex(s => s.id === step)

  async function generateScript() {
    if (!prompt.trim()) { setError('Enter a topic or idea for your video'); return }
    setError('')
    setLoading(true)
    setLoadingMsg('Analysing viral potential…')

    try {
      setLoadingMsg('Writing your script with Claude AI…')
      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, platform, tone, duration }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Script generation failed')
      setScript(data.script)
      setEditHook(data.script.hook)
      setEditBody(data.script.body)
      setEditCta(data.script.cta)
      setStep('script')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  async function generateVideo() {
    setStep('render')
    setRenderProgress(0)
    setError('')

    const finalScript = {
      ...script!,
      hook: editHook,
      body: editBody,
      cta: editCta,
    }

    // Simulate render progress while calling API
    const timer = setInterval(() => {
      setRenderProgress(p => Math.min(p + Math.random() * 8, 88))
    }, 800)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: finalScript, voice, music, captionStyle, platform }),
      })
      const data = await res.json()
      clearInterval(timer)
      if (!data.success) throw new Error(data.error || 'Render failed')
      setRenderProgress(100)
      setTimeout(() => setStep('done'), 800)
    } catch (e: any) {
      clearInterval(timer)
      setError(e.message || 'Render failed. Please try again.')
      setStep('voice')
    }
  }

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--fog)' }}>{label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{value}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )

  return (
    <div className="page-content fade-in" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: 'var(--ivory)', marginBottom: 4 }}>
          {step === 'done' ? '✦ Video Ready' : 'Create Video'}
        </h1>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 0, marginTop: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
                background: i === stepIdx ? 'rgba(194,154,64,.12)' : 'transparent',
                color: i < stepIdx ? 'var(--jade)' : i === stepIdx ? 'var(--gold)' : 'var(--iron)',
                border: i === stepIdx ? '1px solid rgba(194,154,64,.25)' : '1px solid transparent',
              }}>
                {i < stepIdx ? '✓' : i + 1} {s.label}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,.06)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(170,24,40,.08)', border: '1px solid rgba(170,24,40,.2)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#ff8080' }}>
          {error}
        </div>
      )}

      {/* ── STEP 1: PROMPT ── */}
      {step === 'prompt' && (
        <div className="fade-in">
          <div className="card mb-4">
            <label className="label mb-3">What's your video about?</label>
            <textarea
              className="textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. '5 AI tools that are replacing designers in 2025' or 'How I made $10K from one viral video' or 'Morning routine that changed my life'…"
              style={{ minHeight: 120, marginBottom: 0 }}
              onKeyDown={e => e.key === 'Enter' && e.metaKey && generateScript()}
            />
            <div style={{ fontSize: 10, color: 'var(--fog)', marginTop: 6, fontFamily: 'monospace' }}>⌘↵ to generate</div>
          </div>

          <div className="grid col-3 gap-3 mb-4">
            <div>
              <label className="label">Platform</label>
              <select className="input" value={platform} onChange={e => setPlatform(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tone</label>
              <select className="input" value={tone} onChange={e => setTone(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration</label>
              <select className="input" value={duration} onChange={e => setDuration(Number(e.target.value))}
                style={{ appearance: 'none', cursor: 'pointer' }}>
                {[15, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d}s</option>)}
              </select>
            </div>
          </div>

          <button className="btn btn-primary w-full" style={{ padding: '14px', fontSize: 13 }}
            onClick={generateScript} disabled={loading || !prompt.trim()}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(0,0,0,.3)', borderTopColor: 'var(--void)', borderRadius: '50%' }} />
                {loadingMsg || 'Generating…'}
              </span>
            ) : '✦ Generate Script'}
          </button>
        </div>
      )}

      {/* ── STEP 2: SCRIPT ── */}
      {step === 'script' && script && (
        <div className="fade-in">
          {/* Scores */}
          <div className="grid col-3 gap-3 mb-4">
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>{script.viralScore}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fog)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>Viral Score</div>
            </div>
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>{script.hookScore}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fog)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>Hook Score</div>
            </div>
            <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: 'var(--gold)', lineHeight: 1 }}>{script.estimatedReach}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fog)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 4 }}>Est. Reach</div>
            </div>
          </div>

          {/* Script editor */}
          <div className="card mb-4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ivory)', marginBottom: 2 }}>{script.title}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fog)' }}>{script.duration}s · {platform} · {tone}</div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 10, padding: '6px 12px' }}
                onClick={() => setEditingScript(e => !e)}>
                {editingScript ? 'Done Editing' : '✎ Edit Script'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: '🎣 Hook', key: 'hook', value: editHook, setter: setEditHook, desc: 'First 3 seconds — stop the scroll' },
                { label: '📖 Body', key: 'body', value: editBody, setter: setEditBody, desc: 'Main content' },
                { label: '📣 CTA', key: 'cta', value: editCta, setter: setEditCta, desc: 'Call to action' },
              ].map(field => (
                <div key={field.key} style={{ background: 'var(--deep)', borderRadius: 8, padding: 14, border: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{field.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--fog)' }}>{field.desc}</span>
                  </div>
                  {editingScript ? (
                    <textarea className="textarea" value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      style={{ minHeight: field.key === 'body' ? 120 : 60, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(194,154,64,.2)' }} />
                  ) : (
                    <p style={{ fontSize: 14, color: 'var(--silver)', lineHeight: 1.7 }}>{field.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Hashtags */}
            {script.hashtags?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {script.hashtags.map(h => (
                  <span key={h} className="badge badge-fog">#{h}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => { setStep('prompt'); setScript(null) }}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '13px' }}
              onClick={() => setStep('voice')}>
              Continue → Voice & Music
            </button>
            <button className="btn btn-ghost" style={{ fontSize: 10 }} onClick={generateScript} disabled={loading}>
              {loading ? '…' : '↻ Regenerate'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: VOICE & MUSIC ── */}
      {step === 'voice' && (
        <div className="fade-in">
          <div className="card mb-4">
            <label className="label mb-4">AI Voice</label>
            <div className="grid col-3 gap-3">
              {VOICES.map(v => (
                <div key={v.id} onClick={() => setVoice(v.id)} style={{
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                  background: voice === v.id ? 'rgba(194,154,64,.08)' : 'var(--deep)',
                  border: `1px solid ${voice === v.id ? 'rgba(194,154,64,.3)' : 'rgba(255,255,255,.05)'}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ivory)', marginBottom: 3 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--fog)' }}>{v.desc}</div>
                  {voice === v.id && <div style={{ fontSize: 9, color: 'var(--gold)', marginTop: 4, fontFamily: 'monospace' }}>SELECTED ✓</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid col-2 gap-4 mb-4">
            <div className="card">
              <label className="label mb-3">Background Music</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MUSIC_STYLES.map(m => (
                  <div key={m} onClick={() => setMusic(m)} style={{
                    padding: '8px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: music === m ? 'rgba(194,154,64,.06)' : 'transparent',
                    border: `1px solid ${music === m ? 'rgba(194,154,64,.2)' : 'transparent'}`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: music === m ? 'var(--gold)' : 'var(--iron)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: music === m ? 'var(--gold)' : 'var(--silver)' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <label className="label mb-3">Caption Style</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Bold', 'Minimal', 'Cinematic', 'Karaoke', 'None'].map(c => (
                  <div key={c} onClick={() => setCaptionStyle(c)} style={{
                    padding: '8px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: captionStyle === c ? 'rgba(194,154,64,.06)' : 'transparent',
                    border: `1px solid ${captionStyle === c ? 'rgba(194,154,64,.2)' : 'transparent'}`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: captionStyle === c ? 'var(--gold)' : 'var(--iron)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: captionStyle === c ? 'var(--gold)' : 'var(--silver)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep('script')}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '13px' }}
              onClick={generateVideo}>
              ✦ Generate Video
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: RENDERING ── */}
      {step === 'render' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 24, animation: 'pulse 2s ease infinite' }}>✦</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: 'var(--ivory)', marginBottom: 8 }}>
            ORVIX is creating your video
          </h2>
          <p style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 40 }}>
            Generating voiceover · Mixing music · Adding captions · Assembling reel
          </p>

          <div style={{ maxWidth: 400, margin: '0 auto 20px' }}>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${renderProgress}%` }} />
            </div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>
            {Math.round(renderProgress)}%
          </div>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { done: renderProgress > 15, label: 'Script finalised' },
              { done: renderProgress > 35, label: 'AI voiceover generated' },
              { done: renderProgress > 55, label: 'Music & captions added' },
              { done: renderProgress > 75, label: 'Video assembled' },
              { done: renderProgress >= 100, label: 'Export ready' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12,
                color: item.done ? 'var(--jade)' : 'var(--iron)' }}>
                <span>{item.done ? '✓' : '○'}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 5: DONE ── */}
      {step === 'done' && script && (
        <div className="fade-in">
          <div className="card mb-4" style={{ textAlign: 'center', padding: '40px 24px', background: 'rgba(194,154,64,.04)', borderColor: 'rgba(194,154,64,.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: 'var(--ivory)', marginBottom: 8 }}>
              Video Generated!
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 24 }}>
              "{editHook.slice(0, 60)}…"
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-gold">Viral Score: {script.viralScore}</span>
              <span className="badge badge-jade">{platform}</span>
              <span className="badge badge-fog">{voice} voice</span>
              <span className="badge badge-fog">{music} music</span>
            </div>
          </div>

          {/* Script summary */}
          <div className="card mb-4">
            <div className="label mb-3">Your Script</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Hook', text: editHook },
                { label: 'Body', text: editBody },
                { label: 'CTA', text: editCta },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 12px', background: 'var(--deep)', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>{s.text}</div>
                </div>
              ))}
            </div>
            {script.hashtags?.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {script.hashtags.map(h => <span key={h} className="badge badge-fog">#{h}</span>)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: '13px' }}
              onClick={() => { setStep('prompt'); setPrompt(''); setScript(null); setRenderProgress(0) }}>
              ✦ Create Another Video
            </button>
            <button className="btn btn-ghost"
              onClick={() => { setStep('prompt'); setScript(null); setRenderProgress(0) }}>
              ↻ Refine This
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
