'use client'

import { useState } from 'react'
import { useMusicContext } from './MusicContext'

interface LandingHeaderProps {
  onSignIn: () => void
  onSignUp: () => void
}

const NAV_ITEMS = [
  { id: 'prove', label: 'Преимущества' },
  { id: 'features', label: 'Возможности' },
  { id: 'steps', label: 'Как начать' },
]

export function LandingHeader({ onSignIn, onSignUp }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const music = useMusicContext()
  const playing = music?.isPlaying ?? false
  const toggleMusic = music?.toggle ?? (() => {})

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileOpen(false)
  }

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%)',
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(141,94,244,0.2)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>

            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                filter: 'drop-shadow(0 0 20px rgba(141,94,244,0.5))',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="CyberT" style={{ height: '34px', width: 'auto' }} />
            </button>

            {/* Desktop nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '3.2rem' }} className="landing-nav-desktop">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.6rem',
                    fontWeight: 500,
                    fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                    color: 'rgba(255,255,255,0.75)',
                    letterSpacing: '0.04em',
                    padding: '0.4rem 0',
                    position: 'relative',
                    transition: 'color 0.25s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop auth + music buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }} className="landing-nav-desktop">
              <button
                onClick={onSignIn}
                style={{
                  padding: '1rem 2.8rem',
                  borderRadius: '1.2rem',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                  color: '#fff',
                  background: 'transparent',
                  border: '2px solid rgba(141,94,244,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: '0 0 20px rgba(141,94,244,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(141,94,244,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.9)'
                  e.currentTarget.style.boxShadow = '0 0 28px rgba(141,94,244,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(141,94,244,0.15)'
                }}
              >
                Вход
              </button>
              <button
                onClick={onSignUp}
                style={{
                  padding: '1rem 2.8rem',
                  borderRadius: '1.2rem',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                  color: '#fff',
                  background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
                  border: '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(141,94,244,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(141,94,244,0.55)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(141,94,244,0.4)'
                }}
              >
                Регистрация
              </button>

              {/* Music toggle — same style as Вход */}
              <button
                onClick={toggleMusic}
                title={playing ? 'Пауза' : 'Включить музыку'}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '1.2rem',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                  color: '#fff',
                  background: playing ? 'rgba(141,94,244,0.12)' : 'transparent',
                  border: '2px solid rgba(141,94,244,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: playing ? '0 0 28px rgba(141,94,244,0.35)' : '0 0 20px rgba(141,94,244,0.15)',
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(141,94,244,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.9)'
                  e.currentTarget.style.boxShadow = '0 0 28px rgba(141,94,244,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = playing ? 'rgba(141,94,244,0.12)' : 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'
                  e.currentTarget.style.boxShadow = playing ? '0 0 28px rgba(141,94,244,0.35)' : '0 0 20px rgba(141,94,244,0.15)'
                }}
              >
                {playing ? (
                  <span style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '16px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <span key={i} style={{
                        display: 'block', width: '3px', borderRadius: '2px',
                        background: '#c9aaff',
                        boxShadow: '0 0 6px rgba(185,153,253,0.9)',
                        animation: `musicBar${i} 0.${4 + i}s ease-in-out infinite alternate`,
                      }} />
                    ))}
                  </span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                )}
                DnB
              </button>
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="landing-nav-mobile"
              style={{
                display: 'none',
                flexDirection: 'column' as const,
                justifyContent: 'space-between',
                width: '32px',
                height: '22px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '3px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #8D5EF4, #B999FD)',
                    boxShadow: '0 0 8px rgba(141,94,244,0.4)',
                  }}
                />
              ))}
            </button>
          </div>

          {/* Bottom accent line */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, rgba(141,94,244,0) 0%, rgba(141,94,244,0.6) 50%, rgba(141,94,244,0) 100%)',
          }} />
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10003,
          pointerEvents: mobileOpen ? 'all' : 'none',
          opacity: mobileOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '85%',
            maxWidth: '400px',
            background: 'linear-gradient(145deg, rgba(20,20,21,0.98) 0%, rgba(30,30,35,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(141,94,244,0.3)',
            boxShadow: '-4px 0 40px rgba(0,0,0,0.5)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            padding: '8rem 3rem 3rem',
            overflowY: 'auto',
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute',
              top: '2.4rem',
              right: '2.4rem',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              fontSize: '2.4rem',
              color: '#fff',
              fontWeight: 300,
              background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(141,94,244,0.4)',
            }}
          >×</button>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3.2rem', marginBottom: '4rem' }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.8rem',
                  fontWeight: 500,
                  fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                  color: 'rgba(255,255,255,0.8)',
                  textAlign: 'left',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#B999FD' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <button
              onClick={() => { onSignIn(); setMobileOpen(false) }}
              style={{
                padding: '1.4rem',
                borderRadius: '1.2rem',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: '#fff',
                background: 'transparent',
                border: '2px solid rgba(141,94,244,0.6)',
                cursor: 'pointer',
              }}
            >Вход</button>
            <button
              onClick={() => { onSignUp(); setMobileOpen(false) }}
              style={{
                padding: '1.4rem',
                borderRadius: '1.2rem',
                fontSize: '1.6rem',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(141,94,244,0.4)',
              }}
            >Регистрация</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-mobile { display: flex !important; }
        }
        @keyframes musicBar1 { from { height: 4px } to { height: 14px } }
        @keyframes musicBar2 { from { height: 8px } to { height: 16px } }
        @keyframes musicBar3 { from { height: 12px } to { height: 6px } }
        @keyframes musicBar4 { from { height: 6px } to { height: 13px } }
      `}</style>
    </>
  )
}
