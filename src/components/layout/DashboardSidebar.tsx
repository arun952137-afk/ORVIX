'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/stores'
import { UserButton } from '@clerk/nextjs'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/studio',    label: 'AI Studio',  icon: '▶' },
  { href: '/editor',    label: 'Editor',     icon: '◧' },
  { href: '/analytics', label: 'Analytics',  icon: '◈' },
  { href: '/scheduler', label: 'Scheduler',  icon: '◷' },
  { href: '/library',   label: 'Library',    icon: '◫' },
]

const BOTTOM_ITEMS = [
  { href: '/team',     label: 'Team',     icon: '◉' },
  { href: '/billing',  label: 'Billing',  icon: '✦' },
  { href: '/settings', label: 'Settings', icon: '◎' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
      background: 'var(--abyss)', borderRight: '1px solid rgba(255,255,255,.04)',
      display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--san)', fontSize: 11, fontWeight: 800, letterSpacing: '.28em', color: 'var(--gold)', textTransform: 'uppercase' }}>ORVIX</div>
          <div style={{ fontFamily: 'var(--mon)', fontSize: 8, letterSpacing: '.15em', color: 'var(--fog)', marginTop: 3 }}>Creator OS</div>
        </Link>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        <div style={{ fontFamily: 'var(--mon)', fontSize: 7, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(90,90,120,.5)', padding: '0 16px', marginBottom: 6 }}>Studio</div>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', textDecoration: 'none',
              fontSize: 12, fontWeight: 500, letterSpacing: '.02em',
              color: active ? 'var(--gold)' : 'var(--fog)',
              borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
              background: active ? 'rgba(194,154,64,.05)' : 'transparent',
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 13, opacity: active ? 1 : 0.6, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div style={{ fontFamily: 'var(--mon)', fontSize: 7, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(90,90,120,.5)', padding: '16px 16px 6px', marginTop: 8 }}>Account</div>
        {BOTTOM_ITEMS.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', textDecoration: 'none',
              fontSize: 12, fontWeight: 500, letterSpacing: '.02em',
              color: active ? 'var(--gold)' : 'var(--fog)',
              borderLeft: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
              background: active ? 'rgba(194,154,64,.05)' : 'transparent',
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 13, opacity: active ? 1 : 0.6, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 28, height: 28, borderRadius: 8 },
              userButtonPopoverCard: { background: 'var(--chamber)', border: '1px solid rgba(194,154,64,.15)', borderRadius: 10 },
            },
          }}
        />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ivory)' }}>My Account</div>
          <div style={{ fontFamily: 'var(--mon)', fontSize: 8, color: 'var(--fog)' }}>Creator OS</div>
        </div>
      </div>
    </aside>
  )
}
