import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — ORVIX' }

export default async function DashboardPage() {
  const user = await currentUser()
  const name = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Creator'

  const stats = [
    { label: 'Videos Created', value: '0', note: 'Start creating →' },
    { label: 'Total Views', value: '0', note: 'Publish to earn views' },
    { label: 'Viral Score Avg', value: '—', note: 'After first video' },
    { label: 'Credits Left', value: '50', note: 'Free plan' },
  ]

  const quickActions = [
    { href: '/create', icon: '✦', label: 'Create Video', desc: 'Prompt → script → voiceover → reel', primary: true },
    { href: '/library', icon: '◫', label: 'My Library', desc: 'View all generated videos', primary: false },
  ]

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, letterSpacing: '-.02em', color: 'var(--ivory)', marginBottom: 6 }}>
          Welcome back, {name}.
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fog)' }}>Your creative universe is ready.</p>
      </div>

      {/* Stats */}
      <div className="grid col-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: 'var(--ivory)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--jade)' }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 32 }}>
        <div className="label mb-4">Quick Actions</div>
        <div className="flex gap-4">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '20px 24px', borderRadius: 10,
              background: a.primary ? 'rgba(194,154,64,.07)' : 'var(--chamber)',
              border: `1px solid ${a.primary ? 'rgba(194,154,64,.2)' : 'rgba(255,255,255,.05)'}`,
              transition: 'all .2s', flex: 1, maxWidth: 320,
            }}>
              <div style={{ fontSize: 22, color: a.primary ? 'var(--gold)' : 'var(--fog)', marginTop: 2 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ivory)', marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fog)', lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Empty state */}
      <div style={{ padding: '48px 0', textAlign: 'center', border: '1px dashed rgba(255,255,255,.06)', borderRadius: 12 }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: .3 }}>✦</div>
        <div style={{ fontSize: 15, color: 'var(--iron)', marginBottom: 8 }}>No videos yet</div>
        <Link href="/create" className="btn btn-primary" style={{ marginTop: 8 }}>
          Create Your First Video
        </Link>
      </div>
    </div>
  )
}
