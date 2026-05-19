'use client'

import { useCreditsStore, useUIStore } from '@/lib/stores'
import { useQuery } from '@tanstack/react-query'
import { UserButton } from '@clerk/nextjs'

export function DashboardNav() {
  const { balance, bonusBalance, plan } = useCreditsStore()

  // Sync credits from API
  const { data } = useQuery({
    queryKey: ['credits'],
    queryFn: () => fetch('/api/credits/balance').then(r => r.json()),
    refetchInterval: 30000,
  })

  const totalCredits = data?.data?.total ?? (balance + bonusBalance)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 220, right: 0, height: 58, zIndex: 99,
      background: 'rgba(3,3,5,.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      <div />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Credits */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 100,
          background: 'rgba(194,154,64,.06)', border: '1px solid rgba(194,154,64,.12)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--mon)', fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>
            {totalCredits.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--mon)', fontSize: 9, color: 'var(--fog)' }}>credits</span>
        </div>

        {/* Plan badge */}
        <div style={{
          padding: '4px 10px', borderRadius: 3,
          background: plan === 'ELITE' ? 'rgba(170,24,40,.12)' : plan === 'PRO' ? 'rgba(194,154,64,.1)' : 'rgba(255,255,255,.04)',
          border: `1px solid ${plan === 'ELITE' ? 'rgba(170,24,40,.2)' : plan === 'PRO' ? 'rgba(194,154,64,.2)' : 'rgba(255,255,255,.06)'}`,
          fontFamily: 'var(--mon)', fontSize: 8, fontWeight: 700, letterSpacing: '.1em',
          color: plan === 'ELITE' ? 'var(--coral)' : plan === 'PRO' ? 'var(--gold)' : 'var(--silver)',
          textTransform: 'uppercase',
        }}>
          {plan}
        </div>

        {/* Add credits button */}
        <a href="/billing" style={{
          padding: '6px 14px', borderRadius: 3, background: 'var(--gold)', border: 'none',
          color: 'var(--void)', fontFamily: 'var(--san)', fontSize: 9, fontWeight: 800,
          letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none',
          transition: 'all .2s', cursor: 'pointer',
        }}>
          + Credits
        </a>
      </div>
    </header>
  )
}
