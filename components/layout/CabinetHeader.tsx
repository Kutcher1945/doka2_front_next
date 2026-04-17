'use client'

import Link from 'next/link'
import { useStore } from '@/store'
import type { User, UserWallet } from '@/types'

interface CabinetHeaderProps {
  user: User
  wallet: UserWallet | null
}

export function CabinetHeader({ user, wallet }: CabinetHeaderProps) {
  const currentLobby = useStore((s) => s.currentLobby)
  const balance = wallet?.balance ?? 0
  const currency = wallet?.currency ?? 'KZT'
  const initials = (user.username || user.email)?.[0]?.toUpperCase() ?? '?'

  return (
    <header style={{
      height: '6.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.4rem',
      background: '#0f0e14',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
        {currentLobby && (
          <Link
            href={`/cabinet/lobby/${currentLobby.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.7rem 1.6rem', borderRadius: '0.8rem',
              background: 'rgba(141,94,244,0.15)',
              border: '1px solid rgba(141,94,244,0.4)',
              color: '#C9AAFF', fontSize: '1.3rem', fontWeight: 600,
              textDecoration: 'none', fontFamily: "'Gotham Pro', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Вернуться в лобби
          </Link>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Balance */}
        <Link
          href="/cabinet/wallet"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            padding: '0.6rem 1.4rem', borderRadius: '0.8rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(141,94,244,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif" }}>
            {balance.toLocaleString('ru-RU')}
          </span>
          <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'Gotham Pro', sans-serif" }}>{currency}</span>
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '2.4rem', background: 'rgba(255,255,255,0.08)' }} />

        {/* User */}
        <Link
          href="/cabinet/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
        >
          <div style={{
            width: '3.4rem', height: '3.4rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8D5EF4, #B999FD)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.4rem', fontWeight: 700,
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(141,94,244,0.4)',
            fontFamily: "'Gotham Pro', sans-serif",
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.2 }}>
              {user.username || user.email?.split('@')[0]}
            </span>
            {user.dota_mmr ? (
              <span style={{ fontSize: '1rem', color: 'rgba(141,94,244,0.8)', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.2 }}>
                {user.dota_mmr} MMR
              </span>
            ) : null}
          </div>
        </Link>
      </div>
    </header>
  )
}
