'use client'

import { useState } from 'react'
import Script from 'next/script'
import toast from 'react-hot-toast'

const CREDIT_PACKS = [
  { key: 'STARTER', credits: 500,  priceINR: '₹299',  priceUSD: '$4.99',  popular: false },
  { key: 'CREATOR', credits: 1200, priceINR: '₹599',  priceUSD: '$9.99',  popular: true  },
  { key: 'STUDIO',  credits: 3000, priceINR: '₹1,299', priceUSD: '$19.99', popular: false },
  { key: 'EMPIRE',  credits: 8000, priceINR: '₹2,999', priceUSD: '$49.99', popular: false },
]

const PLANS = [
  {
    key: 'FREE', name: 'Free', price: '₹0', credits: 50, popular: false,
    features: ['10 videos/month', '720p + watermark', '3 AI voice presets', '2 platforms'],
    current: true,
  },
  {
    key: 'PRO', name: 'Pro', price: '₹830/mo', credits: 2000, popular: true,
    features: ['2,000 credits/month', 'HD no watermark', '500+ AI voices + clone', 'All 6 platforms', 'Viral predictor', 'Trend scanner'],
    current: false,
  },
  {
    key: 'ELITE', name: 'Elite', price: '₹4,071/mo', credits: 10000, popular: false,
    features: ['10,000 credits/month', '4K + white-label', 'Multi-brand workspace', 'Team collaboration', 'API access', 'Priority rendering'],
    current: false,
  },
]

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')

  const handleCreditPack = async (packKey: string) => {
    setLoading(packKey)
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credit_pack', pack: packKey, currency }),
      })
      const { data } = await res.json()

      const rzp = new window.Razorpay({
        key: data.key,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        theme: data.theme,
        prefill: data.prefill,
        handler: () => {
          toast.success(`${data.credits.toLocaleString()} credits added!`)
        },
        modal: { ondismiss: () => setLoading(null) },
      })
      rzp.open()
    } catch {
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleSubscription = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscription', plan, interval: 'monthly' }),
      })
      const { data } = await res.json()

      const rzp = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: data.name,
        description: data.description,
        theme: data.theme,
        prefill: data.prefill,
        handler: () => {
          toast.success(`${plan} plan activated!`)
          window.location.reload()
        },
        modal: { ondismiss: () => setLoading(null) },
      })
      rzp.open()
    } catch {
      toast.error('Failed to start subscription. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { color: 'var(--ivory)' },
    h1: { fontFamily: 'var(--ser)', fontSize: 40, fontWeight: 300, letterSpacing: '-.02em', color: 'var(--ivory)', marginBottom: 8, lineHeight: 1 },
    sub: { fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 48 },
    section: { marginBottom: 56 },
    sectionTitle: { fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 20 },
    plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, border: '1px solid rgba(194,154,64,.08)', borderRadius: 12, overflow: 'hidden' },
    planCard: { background: 'var(--chamber)', padding: '32px 28px', position: 'relative', borderRight: '1px solid rgba(255,255,255,.04)' },
    planName: { fontFamily: 'var(--mon)', fontSize: 8, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 14 },
    planPrice: { fontFamily: 'var(--ser)', fontSize: 36, fontWeight: 300, color: 'var(--ivory)', lineHeight: 1, marginBottom: 6 },
    planCredits: { fontFamily: 'var(--mon)', fontSize: 9, color: 'var(--fog)', marginBottom: 20 },
    planFeat: { fontSize: 12, color: 'var(--silver)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 7 },
    packGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
    packCard: { background: 'var(--chamber)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, padding: '20px 18px', cursor: 'pointer', transition: 'all .2s', position: 'relative' },
    packCredits: { fontFamily: 'var(--ser)', fontSize: 28, fontWeight: 300, color: 'var(--ivory)', lineHeight: 1, marginBottom: 4 },
    packLabel: { fontFamily: 'var(--mon)', fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 14 },
    packPrice: { fontSize: 16, fontWeight: 700, color: 'var(--gold)', marginBottom: 12 },
    btn: { width: '100%', padding: '10px', borderRadius: 4, border: 'none', fontFamily: 'var(--san)', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' },
    btnGold: { background: 'var(--gold)', color: 'var(--void)' },
    btnLine: { background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'var(--silver)' },
  }

  return (
    <div style={s.page}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <h1 style={s.h1}>Billing & Credits</h1>
      <p style={s.sub}>Manage your plan and credit balance</p>

      {/* Currency toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {(['INR', 'USD'] as const).map(c => (
          <button key={c} onClick={() => setCurrency(c)} style={{
            padding: '5px 14px', borderRadius: 100, border: '1px solid',
            borderColor: currency === c ? 'rgba(194,154,64,.4)' : 'rgba(255,255,255,.08)',
            background: currency === c ? 'rgba(194,154,64,.08)' : 'transparent',
            color: currency === c ? 'var(--gold)' : 'var(--fog)',
            fontFamily: 'var(--mon)', fontSize: 9, fontWeight: 600, letterSpacing: '.08em',
            cursor: 'pointer', transition: 'all .2s',
          }}>{c}</button>
        ))}
      </div>

      {/* Plans */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Creator Power Levels</div>
        <div style={s.plansGrid}>
          {PLANS.map((plan, i) => (
            <div key={plan.key} style={{ ...s.planCard, ...(i === 2 ? { borderRight: 'none' } : {}), ...(plan.popular ? { background: 'linear-gradient(165deg,rgba(194,154,64,.07),var(--chamber))' } : {}) }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--void)', fontFamily: 'var(--mon)', fontSize: 7, fontWeight: 800, letterSpacing: '.2em', padding: '4px 14px', borderRadius: '0 0 6px 6px' }}>MOST POPULAR</div>
              )}
              <div style={{ ...s.planName, marginTop: plan.popular ? 16 : 0 }}>{plan.name}</div>
              <div style={s.planPrice}>{plan.price}</div>
              <div style={s.planCredits}>{plan.credits.toLocaleString()} credits/month</div>
              <div style={{ marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,.05)', paddingBottom: 20 }}>
                {plan.features.map(f => (
                  <div key={f} style={s.planFeat}>
                    <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(194,154,64,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => plan.key !== 'FREE' && handleSubscription(plan.key)}
                disabled={plan.key === 'FREE' || loading === plan.key}
                style={{ ...s.btn, ...(plan.popular ? s.btnGold : s.btnLine), opacity: plan.key === 'FREE' ? .4 : 1, cursor: plan.key === 'FREE' ? 'default' : 'pointer' }}
              >
                {loading === plan.key ? 'Opening…' : plan.key === 'FREE' ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit packs */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Top Up Credits</div>
        <div style={s.packGrid}>
          {CREDIT_PACKS.map(pack => (
            <div key={pack.key} style={{ ...s.packCard, borderColor: pack.popular ? 'rgba(194,154,64,.2)' : 'rgba(255,255,255,.05)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(194,154,64,.3)', e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = pack.popular ? 'rgba(194,154,64,.2)' : 'rgba(255,255,255,.05)', e.currentTarget.style.transform = 'translateY(0)')}>
              {pack.popular && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(194,154,64,.12)', border: '1px solid rgba(194,154,64,.25)', borderRadius: 3, padding: '2px 7px', fontFamily: 'var(--mon)', fontSize: 7, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.1em' }}>BEST VALUE</div>
              )}
              <div style={s.packCredits}>{pack.credits.toLocaleString()}</div>
              <div style={s.packLabel}>Credits</div>
              <div style={s.packPrice}>{currency === 'INR' ? pack.priceINR : pack.priceUSD}</div>
              <button
                onClick={() => handleCreditPack(pack.key)}
                disabled={loading === pack.key}
                style={{ ...s.btn, ...(pack.popular ? s.btnGold : s.btnLine) }}
              >
                {loading === pack.key ? 'Opening…' : 'Buy Credits'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
