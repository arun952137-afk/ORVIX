'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudioStore, useCreditsStore } from '@/lib/stores'
import { CREDIT_COSTS } from '@/types'
import type { Platform } from '@/types'

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'TIKTOK',    label: 'TikTok',    icon: '𝒯' },
  { id: 'INSTAGRAM', label: 'Instagram', icon: '◈' },
  { id: 'YOUTUBE',   label: 'YouTube',   icon: '▶' },
  { id: 'LINKEDIN',  label: 'LinkedIn',  icon: '𝓁' },
  { id: 'TWITTER',   label: 'X / Twitter', icon: '𝒳' },
  { id: 'FACEBOOK',  label: 'Facebook',  icon: '𝒻' },
]

const NICHES = [
  'AI & Technology', 'Business & Finance', 'Personal Development',
  'Health & Fitness', 'Fashion & Beauty', 'Travel & Lifestyle',
  'Education', 'Entertainment', 'Sports', 'Food & Cooking',
  'Real Estate', 'Crypto & Web3', 'Gaming', 'Sustainability',
]

const RESOLUTIONS = [
  { id: '720p',  label: '720p HD',    credits: 30, plan: 'FREE' },
  { id: '1080p', label: '1080p Full HD', credits: 40, plan: 'PRO' },
  { id: '4k',    label: '4K Ultra',   credits: 80, plan: 'ELITE' },
]

const CAPTION_STYLES = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Bold, center-screen, animated' },
  { id: 'minimal',   label: 'Minimal',   desc: 'Clean, bottom-bar, subtle' },
  { id: 'bold',      label: 'Bold',      desc: 'High contrast, punchy' },
  { id: 'none',      label: 'None',      desc: 'No captions' },
]

export default function StudioPage() {
  const { isGenerating, setIsGenerating, addJob, generationJobs } = useStudioStore()
  const { balance, bonusBalance, plan } = useCreditsStore()

  const [prompt, setPrompt]               = useState('')
  const [platform, setPlatform]           = useState<Platform>('TIKTOK')
  const [niche, setNiche]                 = useState('')
  const [resolution, setResolution]       = useState('1080p')
  const [captionStyle, setCaptionStyle]   = useState('cinematic')
  const [duration, setDuration]           = useState(60)
  const [generationResult, setGenerationResult] = useState<null | {
    videoId: string
    viralScore: number
    estimatedReach: { low: number; high: number }
    script: { title: string; hook: string; suggestions: string[] }
    creditsUsed: number
    creditsRemaining: number
  }>(null)

  const totalCredits = balance + bonusBalance
  const selectedRes = RESOLUTIONS.find(r => r.id === resolution)!
  const canAfford = totalCredits >= selectedRes.credits

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !canAfford) return
    setIsGenerating(true)
    setGenerationResult(null)

    const jobId = `job_${Date.now()}`
    addJob({
      id: jobId,
      prompt: prompt.trim(),
      status: 'queued',
      progress: 0,
      startedAt: new Date().toISOString(),
    })

    try {
      const res = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), platform, niche: niche || undefined, resolution, captionStyle, duration }),
      })
      const data = await res.json()

      if (data.success) {
        setGenerationResult(data.data)
      } else {
        console.error('Generation failed:', data.error)
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, platform, niche, resolution, captionStyle, duration, isGenerating, canAfford, addJob, setIsGenerating])

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', color: '#e8e4d8', lineHeight: 1 }}>
            AI Studio
          </h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', marginTop: 8 }}>
            {generationJobs.length} videos this session · {totalCredits.toLocaleString()} credits remaining
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '6px 14px', borderRadius: 3,
            background: canAfford ? 'rgba(200,160,80,0.1)' : 'rgba(160,24,40,0.1)',
            border: `1px solid ${canAfford ? 'rgba(200,160,80,0.2)' : 'rgba(160,24,40,0.2)'}`,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: canAfford ? '#c8a050' : '#e05040',
          }}>
            {totalCredits.toLocaleString()} credits
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* Left — Generation Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Prompt */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 24 }}>
            <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 12 }}>
              What do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 5 AI tools that will replace your entire design team in 2025..."
              rows={4}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5,
                padding: '14px 16px', color: '#e8e4d8',
                fontFamily: 'Syne, system-ui, sans-serif', fontSize: 14,
                outline: 'none', resize: 'none', lineHeight: 1.6,
              }}
              maxLength={500}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(200,160,80,0.3)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#404058' }}>
                {prompt.length}/500
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['AI Tools', 'Side Hustle', 'Productivity', 'Growth Hack'].map(s => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    style={{
                      padding: '3px 9px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)',
                      background: 'transparent', color: '#5a5a78',
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 9, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(200,160,80,0.2)'; (e.target as HTMLElement).style.color = '#c8a050' }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.target as HTMLElement).style.color = '#5a5a78' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 24 }}>
            <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 12 }}>
              Target Platform
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    padding: '10px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${platform === p.id ? 'rgba(200,160,80,0.4)' : 'rgba(255,255,255,0.05)'}`,
                    background: platform === p.id ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
                    color: platform === p.id ? '#c8a050' : '#5a5a78',
                    fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Niche + Settings row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
              <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 10 }}>
                Niche
              </label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5,
                  padding: '10px 12px', color: niche ? '#e8e4d8' : '#404058',
                  fontFamily: 'Syne, sans-serif', fontSize: 13, outline: 'none',
                }}
              >
                <option value="">Any niche</option>
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
              <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 10 }}>
                Duration: {duration}s
              </label>
              <input
                type="range" min={15} max={180} step={15} value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#c8a050' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {[15, 60, 90, 180].map(v => (
                  <span key={v} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: duration === v ? '#c8a050' : '#404058' }}>
                    {v}s
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
            <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 10 }}>
              Export Quality
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {RESOLUTIONS.map(r => {
                const locked = (r.plan === 'PRO' && plan === 'FREE') || (r.plan === 'ELITE' && plan !== 'ELITE')
                return (
                  <button
                    key={r.id}
                    onClick={() => !locked && setResolution(r.id)}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 6, cursor: locked ? 'not-allowed' : 'pointer',
                      border: `1px solid ${resolution === r.id ? 'rgba(200,160,80,0.4)' : 'rgba(255,255,255,0.05)'}`,
                      background: resolution === r.id ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
                      opacity: locked ? 0.4 : 1, transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: resolution === r.id ? '#c8a050' : '#7878a0', marginBottom: 3 }}>
                      {r.label}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#404058' }}>
                      {r.credits} credits
                    </div>
                    {locked && (
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#c8a050', marginTop: 2 }}>
                        {r.plan}+
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Caption Style */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
            <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a5a78', display: 'block', marginBottom: 10 }}>
              Caption Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {CAPTION_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setCaptionStyle(s.id)}
                  style={{
                    padding: '10px 8px', borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${captionStyle === s.id ? 'rgba(200,160,80,0.4)' : 'rgba(255,255,255,0.05)'}`,
                    background: captionStyle === s.id ? 'rgba(200,160,80,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 600, color: captionStyle === s.id ? '#c8a050' : '#7878a0', marginBottom: 3 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#404058', lineHeight: 1.4 }}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || !canAfford}
            style={{
              width: '100%', padding: '18px 24px',
              background: !prompt.trim() || isGenerating || !canAfford ? '#20202e' : '#c8a050',
              border: 'none', borderRadius: 5, cursor: !prompt.trim() || isGenerating || !canAfford ? 'not-allowed' : 'pointer',
              fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 800,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: !prompt.trim() || isGenerating || !canAfford ? '#404058' : '#050507',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}
          >
            {isGenerating ? (
              <>
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating…
              </>
            ) : !canAfford ? (
              `Need ${selectedRes.credits} credits — Top up`
            ) : (
              `Generate Video — ${selectedRes.credits} credits`
            )}
          </button>

          {!canAfford && (
            <div style={{
              padding: '14px 16px', borderRadius: 8,
              background: 'rgba(160,24,40,0.08)', border: '1px solid rgba(160,24,40,0.2)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              color: '#e05040', textAlign: 'center',
            }}>
              You need {selectedRes.credits - totalCredits} more credits.
              <button style={{ marginLeft: 8, color: '#c8a050', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Top up or upgrade →
              </button>
            </div>
          )}
        </div>

        {/* Right — Result / Queue Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 96 }}>

          {/* Generation Result */}
          <AnimatePresence>
            {generationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  background: 'rgba(200,160,80,0.06)', border: '1px solid rgba(200,160,80,0.2)',
                  borderRadius: 12, padding: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c8a050' }}>
                    Generation Complete
                  </span>
                  <div style={{
                    padding: '4px 10px', borderRadius: 3, background: '#c01e30',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>
                    {generationResult.viralScore} Viral
                  </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e4d8', marginBottom: 6, lineHeight: 1.3 }}>
                  {generationResult.script.title}
                </div>

                <div style={{ fontSize: 12, color: '#7878a0', marginBottom: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{generationResult.script.hook}"
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, color: '#c8a050', lineHeight: 1 }}>
                      {(generationResult.estimatedReach.low / 1000).toFixed(0)}K–{(generationResult.estimatedReach.high / 1000).toFixed(0)}K
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#5a5a78', marginTop: 4 }}>Est. Reach</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, color: '#e8e4d8', lineHeight: 1 }}>
                      {generationResult.creditsRemaining.toLocaleString()}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#5a5a78', marginTop: 4 }}>Credits Left</div>
                  </div>
                </div>

                {generationResult.script.suggestions.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5a78', marginBottom: 8 }}>
                      AI Suggestions
                    </div>
                    {generationResult.script.suggestions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c8a050', marginTop: 5, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#7878a0', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button style={{
                  width: '100%', marginTop: 14, padding: '10px 16px',
                  background: '#c8a050', border: 'none', borderRadius: 4,
                  fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: '#050507',
                  cursor: 'pointer',
                }}>
                  Open in Editor
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Queue */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5a78' }}>
                Render Queue
              </span>
              {generationJobs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', animation: 'livepulse 1.2s ease-in-out infinite' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#4ade80' }}>
                    {generationJobs.filter(j => j.status === 'rendering').length} rendering
                  </span>
                </div>
              )}
            </div>

            {generationJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#404058' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>◌</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em' }}>
                  No active renders
                </div>
              </div>
            ) : (
              generationJobs.map(job => (
                <div key={job.id} style={{
                  padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#e8e4d8', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.prompt}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#5a5a78', marginTop: 2 }}>
                        {job.status}
                      </div>
                    </div>
                    {job.viralScore && (
                      <div style={{
                        padding: '2px 7px', borderRadius: 3, background: 'rgba(192,30,48,0.15)',
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: '#e05040',
                      }}>
                        {job.viralScore}
                      </div>
                    )}
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 1,
                      background: 'linear-gradient(90deg,#c8a050,#e0b860)',
                      width: `${job.status === 'done' ? 100 : job.progress}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Credit breakdown */}
          <div style={{ background: '#0c0c16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a5a78', marginBottom: 14 }}>
              Credit Costs
            </div>
            {Object.entries(CREDIT_COSTS).slice(0, 6).map(([key, cost]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 11, color: '#7878a0' }}>{cost.description}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#c8a050', fontWeight: 600 }}>
                  {cost.cost} cr
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livepulse { 0%,100%{opacity:1}50%{opacity:.3} }
      `}</style>
    </div>
  )
}
