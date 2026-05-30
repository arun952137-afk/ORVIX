import { auth } from '@/auth'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — ORVIX' }

export default async function DashboardPage() {
  const session = await auth()
  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'Creator'

  return (
    <div className="page-content fade-in">
      <div className="mb-8">
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:36, fontWeight:400, letterSpacing:'-.02em', color:'var(--ivory)', marginBottom:6 }}>
          Welcome back, {name}.
        </h1>
        <p style={{ fontSize:13, color:'var(--fog)' }}>Your creative universe is ready.</p>
      </div>

      <div className="grid col-4 gap-3 mb-8">
        {[
          { label:'Videos Created', value:'0', note:'Start creating →' },
          { label:'Total Views', value:'0', note:'Publish to earn views' },
          { label:'Viral Score Avg', value:'—', note:'After first video' },
          { label:'Credits Left', value:'50', note:'Free plan' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px 18px' }}>
            <div style={{ fontFamily:'monospace', fontSize:8, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--fog)', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:28, fontWeight:400, color:'var(--ivory)', lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontFamily:'monospace', fontSize:9, color:'var(--jade)' }}>{s.note}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <Link href="/create" style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'20px 24px', borderRadius:10, background:'rgba(194,154,64,.07)', border:'1px solid rgba(194,154,64,.2)', transition:'all .2s', flex:1, maxWidth:320, textDecoration:'none' }}>
          <div style={{ fontSize:22, color:'var(--gold)', marginTop:2 }}>✦</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--ivory)', marginBottom:4 }}>Create Video</div>
            <div style={{ fontSize:12, color:'var(--fog)', lineHeight:1.5 }}>Prompt → script → voiceover → reel</div>
          </div>
        </Link>
        <Link href="/library" style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'20px 24px', borderRadius:10, background:'var(--chamber)', border:'1px solid rgba(255,255,255,.05)', transition:'all .2s', flex:1, maxWidth:320, textDecoration:'none' }}>
          <div style={{ fontSize:22, color:'var(--fog)', marginTop:2 }}>◫</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--ivory)', marginBottom:4 }}>My Library</div>
            <div style={{ fontSize:12, color:'var(--fog)', lineHeight:1.5 }}>View all generated videos</div>
          </div>
        </Link>
      </div>

      <div style={{ padding:'48px 0', textAlign:'center', border:'1px dashed rgba(255,255,255,.06)', borderRadius:12 }}>
        <div style={{ fontSize:32, marginBottom:12, opacity:.3 }}>✦</div>
        <div style={{ fontSize:15, color:'var(--iron)', marginBottom:20 }}>No videos yet</div>
        <Link href="/create" className="btn btn-primary">Create Your First Video</Link>
      </div>
    </div>
  )
}
