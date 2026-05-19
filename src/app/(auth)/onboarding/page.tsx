'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const NICHES = ['AI & Technology', 'Business & Finance', 'Personal Development', 'Health & Fitness', 'Fashion & Beauty', 'Travel & Lifestyle', 'Education', 'Entertainment', 'Sports', 'Food & Cooking', 'Real Estate', 'Crypto & Web3', 'Gaming', 'Sustainability']
const PLATFORMS = ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'LINKEDIN', 'TWITTER', 'FACEBOOK']
const GOALS = ['Grow a personal brand', 'Build a business', 'Run a creator agency', 'Monetize content', 'Educate my audience', 'Entertain and grow']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ niche: '', platforms: [] as string[], goal: '', username: '' })
  const [loading, setLoading] = useState(false)

  const totalSteps = 4

  const handleFinish = async () => {
    setLoading(true)
    try {
      await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      toast.success('Welcome to ORVIX!')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const s: Record<string, React.CSSProperties> = {
    wrap: { minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    inner: { maxWidth: 560, width: '100%' },
    logo: { fontFamily: 'var(--san)', fontSize: 12, fontWeight: 800, letterSpacing: '.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 48, textAlign: 'center' as const },
    progress: { height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, marginBottom: 48, overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg,var(--gold),var(--gold-l))', borderRadius: 1, transition: 'width .5s cubic-bezier(.16,1,.3,1)' },
    stepTag: { fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 12 },
    title: { fontFamily: 'var(--ser)', fontSize: 36, fontWeight: 300, color: 'var(--ivory)', lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: 8 },
    subtitle: { fontSize: 14, color: 'var(--fog)', lineHeight: 1.7, marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 36 },
    chip: { padding: '11px 16px', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, background: 'rgba(255,255,255,.02)', cursor: 'pointer', transition: 'all .15s', fontSize: 13, color: 'var(--silver)', textAlign: 'center' as const },
    chipOn: { borderColor: 'rgba(194,154,64,.4)', background: 'rgba(194,154,64,.08)', color: 'var(--gold)' },
    input: { width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, color: 'var(--ivory)', fontFamily: 'var(--san)', fontSize: 14, outline: 'none', marginBottom: 28 },
    btnRow: { display: 'flex', gap: 12 },
    btnNext: { flex: 1, padding: '14px', background: 'var(--gold)', border: 'none', borderRadius: 4, color: 'var(--void)', fontFamily: 'var(--san)', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' },
    btnBack: { padding: '14px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, color: 'var(--fog)', fontFamily: 'var(--san)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' },
  }

  const steps = [
    {
      tag: 'Step 1 of 4', title: 'Choose your niche.', subtitle: 'What kind of content do you create? This helps ORVIX AI tailor everything for you.',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 36 }}>
          {NICHES.map(n => (
            <div key={n} onClick={() => setData(d => ({ ...d, niche: n }))}
              style={{ ...s.chip, ...(data.niche === n ? s.chipOn : {}) }}>{n}</div>
          ))}
        </div>
      ),
      canNext: !!data.niche,
    },
    {
      tag: 'Step 2 of 4', title: 'Where do you post?', subtitle: 'Select all your platforms. ORVIX will auto-optimize content for each one.',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 36 }}>
          {PLATFORMS.map(p => (
            <div key={p} onClick={() => setData(d => ({ ...d, platforms: d.platforms.includes(p) ? d.platforms.filter(x => x !== p) : [...d.platforms, p] }))}
              style={{ ...s.chip, ...(data.platforms.includes(p) ? s.chipOn : {}) }}>{p}</div>
          ))}
        </div>
      ),
      canNext: data.platforms.length > 0,
    },
    {
      tag: 'Step 3 of 4', title: "What's your goal?", subtitle: 'This shapes how ORVIX writes scripts and plans your content strategy.',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 36 }}>
          {GOALS.map(g => (
            <div key={g} onClick={() => setData(d => ({ ...d, goal: g }))}
              style={{ ...s.chip, ...(data.goal === g ? s.chipOn : {}), textAlign: 'left' as const }}>{g}</div>
          ))}
        </div>
      ),
      canNext: !!data.goal,
    },
    {
      tag: 'Step 4 of 4', title: 'Choose your creator name.', subtitle: 'This is your public identity in the ORVIX creator universe.',
      content: (
        <input
          style={s.input}
          placeholder="@yourcreatorname"
          value={data.username}
          onChange={e => setData(d => ({ ...d, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() }))}
          onFocus={e => e.target.style.borderColor = 'rgba(194,154,64,.3)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.07)'}
          maxLength={30}
        />
      ),
      canNext: data.username.length >= 3,
    },
  ]

  const currentStep = steps[step - 1]

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.logo}>ORVIX</div>

        <div style={s.progress}>
          <div style={{ ...s.progressFill, width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div style={s.stepTag}>{currentStep.tag}</div>
        <h1 style={s.title}>{currentStep.title}</h1>
        <p style={s.subtitle}>{currentStep.subtitle}</p>

        {currentStep.content}

        <div style={s.btnRow}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={s.btnBack}>Back</button>
          )}
          <button
            onClick={step < totalSteps ? () => setStep(s => s + 1) : handleFinish}
            disabled={!currentStep.canNext || loading}
            style={{ ...s.btnNext, opacity: currentStep.canNext ? 1 : .4, cursor: currentStep.canNext ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Setting up…' : step < totalSteps ? 'Continue' : 'Enter ORVIX →'}
          </button>
        </div>
      </div>
    </div>
  )
}
