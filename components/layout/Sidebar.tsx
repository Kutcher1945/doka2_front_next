'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const nav = [
  {
    href: '/cabinet', label: 'Главная', exact: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href: '/cabinet/lobby', label: 'Лобби', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="14.5 2 18.5 9 22 9 22 11 2 11 2 9 5.5 9 9.5 2 14.5 2"/><line x1="12" y1="11" x2="12" y2="22"/><line x1="7" y1="22" x2="17" y2="22"/></svg>,
  },
  {
    href: '/cabinet/wallet', label: 'Кошелёк', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  },
  {
    href: '/cabinet/history', label: 'История', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    href: '/cabinet/friends', label: 'Друзья', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/cabinet/profile', label: 'Профиль', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: '/cabinet/support', label: 'Поддержка', exact: false,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      width: '24rem', minHeight: '100vh',
      background: '#0f0e14',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      padding: '2.4rem 1.2rem',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link href="/cabinet" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3.2rem', textDecoration: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="CyberT" style={{ height: '3.2rem', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(141,94,244,0.4))' }} />
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {nav.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                padding: '1.1rem 1.6rem',
                borderRadius: '1rem',
                fontSize: '1.4rem', fontWeight: 500,
                textDecoration: 'none',
                fontFamily: "'Gotham Pro', sans-serif",
                transition: 'all 0.2s',
                background: active ? 'linear-gradient(135deg, rgba(141,94,244,0.25) 0%, rgba(141,94,244,0.1) 100%)' : 'transparent',
                color: active ? '#C9AAFF' : 'rgba(255,255,255,0.4)',
                borderLeft: active ? '2px solid #8D5EF4' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' } }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.6rem 0' }} />

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{
          display: 'flex', alignItems: 'center', gap: '1.2rem',
          padding: '1.1rem 1.6rem', borderRadius: '1rem',
          fontSize: '1.4rem', fontWeight: 500,
          fontFamily: "'Gotham Pro', sans-serif",
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)',
          transition: 'all 0.2s', width: '100%', textAlign: 'left' as const,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.8)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Выйти
      </button>
    </aside>
  )
}
