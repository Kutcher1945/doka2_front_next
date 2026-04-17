'use client'

import Link from 'next/link'

export function ActionButtons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' }}>

      {/* Find lobby — primary CTA */}
      <Link
        href="/cabinet/lobby"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.4rem',
          padding: '2rem 3.2rem', borderRadius: '1.4rem', textDecoration: 'none',
          background: 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
          color: '#fff', fontSize: '1.7rem', fontWeight: 700,
          fontFamily: "'Colus', 'Gotham Pro', sans-serif",
          boxShadow: '0 4px 32px rgba(141,94,244,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          position: 'relative', overflow: 'hidden',
          transition: 'transform 0.15s, box-shadow 0.15s',
          letterSpacing: '0.06em',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(141,94,244,0.55), inset 0 1px 0 rgba(255,255,255,0.15)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 32px rgba(141,94,244,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}
      >
        {/* shimmer */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Найти лобби
      </Link>

      {/* Create lobby — secondary */}
      <Link
        href="/cabinet/lobby/create"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem',
          padding: '2rem', borderRadius: '1.4rem', textDecoration: 'none',
          background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
          border: '1px solid rgba(141,94,244,0.25)',
          color: 'rgba(185,153,253,0.9)', fontSize: '1.6rem', fontWeight: 700,
          fontFamily: "'Colus', 'Gotham Pro', sans-serif",
          transition: 'all 0.15s',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'linear-gradient(160deg, #141225 0%, #100e1e 100%)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.25)'; e.currentTarget.style.color = 'rgba(185,153,253,0.9)'; e.currentTarget.style.background = 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Создать лобби
      </Link>

    </div>
  )
}
