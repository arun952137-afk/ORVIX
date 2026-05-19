'use client'

import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', '30d'],
    queryFn: () => fetch('/api/analytics?range=30d').then(r => r.json()),
    refetchInterval: 60000,
  })

  const analytics = data?.data

  const s: Record<string, React.CSSProperties> = {
    h1: { fontFamily: 'var(--ser)', fontSize: 40, fontWeight: 300, letterSpacing: '-.02em', color: 'var(--ivory)', marginBottom: 8, lineHeight: 1 },
    sub: { fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 40 },
    card: { background: 'var(--chamber)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, padding: '20px 22px' },
    label: { fontFamily: 'var(--mon)', fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 8 },
    val: { fontFamily: 'var(--ser)', fontSize: 30, fontWeight: 400, color: 'var(--ivory)', lineHeight: 1 },
    change: { fontFamily: 'var(--mon)', fontSize: 9, color: '#4ade80', marginTop: 4 },
  }

  if (isLoading) {
    return (
      <div>
        <h1 style={s.h1}>Analytics</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ ...s.card, height: 100, background: 'linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  const summary = analytics?.summary ?? {}
  const viewsByDay = analytics?.viewsByDay ?? []
  const platformBreakdown = analytics?.platformBreakdown ?? []

  return (
    <div>
      <h1 style={s.h1}>Analytics</h1>
      <p style={s.sub}>30-day performance overview</p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total Views', value: summary.totalViews > 1000000 ? `${(summary.totalViews/1000000).toFixed(1)}M` : `${Math.round((summary.totalViews||0)/1000)}K`, change: 'All time' },
          { label: 'Avg Viral Score', value: summary.avgViralScore || '—', change: 'Per video' },
          { label: 'Videos Created', value: summary.recentVideos || 0, change: 'Last 30 days' },
          { label: 'Credits Used', value: (summary.creditsUsed || 0).toLocaleString(), change: 'This month' },
        ].map((item, i) => (
          <div key={i} style={s.card}>
            <div style={s.label}>{item.label}</div>
            <div style={s.val}>{item.value}</div>
            <div style={s.change}>{item.change}</div>
          </div>
        ))}
      </div>

      {/* Views chart */}
      <div style={{ ...s.card, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={s.label}>Views Over Time</div>
        </div>
        {viewsByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={viewsByDay} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c29a40" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#c29a40" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontFamily: 'var(--mon)', fontSize: 8, fill: 'var(--fog)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--mon)', fontSize: 8, fill: 'var(--fog)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--chamber)', border: '1px solid rgba(194,154,64,.15)', borderRadius: 6, fontFamily: 'var(--mon)', fontSize: 10 }}
                labelStyle={{ color: 'var(--gold)' }}
                itemStyle={{ color: 'var(--silver)' }}
              />
              <Area type="monotone" dataKey="views" stroke="#c29a40" strokeWidth={2} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fog)', fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.1em' }}>No data yet — create your first video</div>
        )}
      </div>

      {/* Platform breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={s.card}>
          <div style={{ ...s.label, marginBottom: 20 }}>Platform Performance</div>
          {platformBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={platformBreakdown} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="platform" tick={{ fontFamily: 'var(--mon)', fontSize: 8, fill: 'var(--fog)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--mon)', fontSize: 8, fill: 'var(--fog)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--chamber)', border: '1px solid rgba(194,154,64,.15)', borderRadius: 6, fontFamily: 'var(--mon)', fontSize: 10 }} />
                <Bar dataKey="views" fill="#c29a40" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fog)', fontFamily: 'var(--mon)', fontSize: 9 }}>No published videos yet</div>
          )}
        </div>

        <div style={s.card}>
          <div style={{ ...s.label, marginBottom: 20 }}>Creator Stats</div>
          {[
            { label: 'Creator Streak', value: `${summary.streak || 0} days`, bar: Math.min(100, (summary.streak || 0) * 3) },
            { label: 'Creator Level', value: `Level ${summary.level || 1}`, bar: ((summary.level || 1) % 10) * 10 },
            { label: 'Credits Used', value: `${(summary.creditsUsed || 0).toLocaleString()}`, bar: Math.min(100, ((summary.creditsUsed || 0) / 2000) * 100) },
            { label: 'Videos Published', value: `${summary.publishedPosts || 0}`, bar: Math.min(100, (summary.publishedPosts || 0) * 5) },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--silver)' }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--mon)', fontSize: 10, color: 'var(--gold)' }}>{item.value}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.bar}%`, background: 'linear-gradient(90deg,var(--gold),var(--gold-l))', borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
