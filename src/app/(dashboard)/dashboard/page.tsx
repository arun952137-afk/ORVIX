import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard' }

async function getDashboardData(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      videos: { orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, title: true, status: true, viralScore: true, totalViews: true, thumbnailUrl: true, createdAt: true, renderProgress: true } },
    },
  })
  if (!user) return null

  const totalViewsAgg = await prisma.video.aggregate({ where: { userId: user.id }, _sum: { totalViews: true } })
  const avgViralScore = await prisma.video.aggregate({ where: { userId: user.id, viralScore: { not: null } }, _avg: { viralScore: true } })

  return {
    user,
    stats: {
      totalViews: Number(totalViewsAgg._sum.totalViews ?? 0),
      totalVideos: user.totalVideos,
      avgViralScore: Math.round((avgViralScore._avg.viralScore ?? 0) * 10) / 10,
      credits: user.credits + user.bonusCredits,
      streak: user.streak,
    },
  }
}

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/login')

  const data = await getDashboardData(clerkId)
  if (!data) redirect('/onboarding')

  const { user, stats } = data

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--ser)', fontSize: 40, fontWeight: 300, letterSpacing: '-.02em', color: 'var(--ivory)', lineHeight: 1, marginBottom: 8 }}>
          Welcome back{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
        </h1>
        <p style={{ fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fog)' }}>
          {user.plan} Plan · {(user.credits + user.bonusCredits).toLocaleString()} credits · {user.streak}d streak
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total Views', value: stats.totalViews > 1000000 ? `${(stats.totalViews/1000000).toFixed(1)}M` : stats.totalViews > 1000 ? `${(stats.totalViews/1000).toFixed(0)}K` : stats.totalViews.toString(), change: '+41%' },
          { label: 'Avg Viral Score', value: stats.avgViralScore || '—', change: '+8 pts' },
          { label: 'Videos Created', value: stats.totalVideos, change: 'Total' },
          { label: 'Credits Left', value: stats.credits.toLocaleString(), change: user.plan },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--chamber)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, padding: '18px 20px', transition: 'border-color .2s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(194,154,64,.15)') as unknown as void}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)') as unknown as void}>
            <div style={{ fontFamily: 'var(--mon)', fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontFamily: 'var(--ser)', fontSize: 28, fontWeight: 400, color: 'var(--ivory)', lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontFamily: 'var(--mon)', fontSize: 9, color: '#4ade80' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <a href="/studio" style={{ padding: '12px 24px', background: 'var(--gold)', borderRadius: 4, color: 'var(--void)', fontFamily: 'var(--san)', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all .2s' }}>
          + Generate Video
        </a>
        <a href="/analytics" style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, color: 'var(--silver)', fontFamily: 'var(--san)', fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all .2s' }}>
          View Analytics
        </a>
      </div>

      {/* Recent videos */}
      <div>
        <div style={{ fontFamily: 'var(--mon)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--fog)', marginBottom: 16 }}>Recent Videos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {user.videos.length === 0 ? (
            <div style={{ gridColumn: 'span 4', padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ser)', fontSize: 24, fontWeight: 300, color: 'var(--iron)', marginBottom: 12 }}>No videos yet</div>
              <a href="/studio" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: 'var(--mon)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Create your first video →</a>
            </div>
          ) : user.videos.map(v => (
            <div key={v.id} style={{ background: 'var(--chamber)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}>
              {/* Thumbnail */}
              <div style={{ aspectRatio: '16/9', background: 'var(--deep)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontFamily: 'var(--mon)', fontSize: 9, color: 'var(--fog)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    {v.status === 'RENDERING' ? `${v.renderProgress}%` : v.status}
                  </div>
                )}
                {v.viralScore && (
                  <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(170,24,40,.9)', borderRadius: 3, padding: '2px 6px', fontFamily: 'var(--mon)', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                    {Math.round(v.viralScore)}
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ivory)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                <div style={{ fontFamily: 'var(--mon)', fontSize: 8, color: 'var(--fog)' }}>
                  {Number(v.totalViews).toLocaleString()} views · {new Date(v.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
