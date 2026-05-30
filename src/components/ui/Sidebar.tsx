'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { href: '/create',    icon: '✦', label: 'Create Video' },
  { href: '/library',   icon: '◫', label: 'Library' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 900, letterSpacing: '.35em', color: 'var(--gold)', textTransform: 'uppercase' }}>ORVIX</div>
        <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fog)', marginTop: 2, letterSpacing: '.1em' }}>AI Creator OS</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`nav-item${path.startsWith(item.href) ? ' active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserButton afterSignOutUrl="/" />
        <div style={{ fontSize: 12, color: 'var(--fog)' }}>Account</div>
      </div>
    </aside>
  )
}
