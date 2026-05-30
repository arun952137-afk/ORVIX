'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { href: '/create',    icon: '✦', label: 'Create Video' },
  { href: '/library',   icon: '◫', label: 'Library' },
]

type User = { name?: string | null; email?: string | null; image?: string | null }

export function Sidebar({ user }: { user?: User }) {
  const path = usePathname()
  return (
    <aside className="sidebar">
      <div style={{ padding:'20px 16px 14px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ fontFamily:'system-ui', fontSize:10, fontWeight:900, letterSpacing:'.35em', color:'var(--gold)', textTransform:'uppercase' }}>ORVIX</div>
        <div style={{ fontFamily:'monospace', fontSize:8, color:'var(--fog)', marginTop:2, letterSpacing:'.1em' }}>AI Creator OS</div>
      </div>
      <nav style={{ flex:1, padding:'10px 0' }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item${path.startsWith(item.href) ? ' active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ fontSize:11, color:'var(--ivory)', marginBottom:2 }}>{user?.name || user?.email?.split('@')[0] || 'Creator'}</div>
        <div style={{ fontSize:10, color:'var(--fog)', marginBottom:10 }}>{user?.email}</div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-ghost"
          style={{ width:'100%', fontSize:10, padding:'6px 10px' }}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
