'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeroBannerProps {
  username: string
  mmr?: number | null
  steamConnected: boolean
}

const SLIDES = [
  {
    decoration: '/images/redesign/carousel-decoration.png',
    decorationStyle: { height: '115%', bottom: 0 },
    accent: '#8D5EF4',
  },
  {
    decoration: '/images/redesign/carousel-decoration-2.png',
    decorationStyle: { height: '110%', bottom: 0 },
    accent: '#5E94F4',
  },
]

export function HeroBanner({ username, mmr, steamConnected }: HeroBannerProps) {
  const [slide, setSlide] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length)
        setFading(false)
      }, 250)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  const goTo = (i: number) => {
    if (i === slide) return
    setFading(true)
    setTimeout(() => { setSlide(i); setFading(false) }, 250)
  }

  const current = SLIDES[slide]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Steam warning */}
      {!steamConnected && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.2rem',
          padding: '1.1rem 1.8rem', borderRadius: '1rem',
          background: 'rgba(251,146,60,0.08)',
          border: '1px solid rgba(251,146,60,0.25)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(251,146,60,0.9)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: '1.3rem', color: 'rgba(251,146,60,0.85)', fontFamily: "'Gotham Pro', sans-serif", flex: 1 }}>
            Steam не подключён — подключите аккаунт, чтобы участвовать в лобби
          </span>
          <Link href="/cabinet/profile" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '1.2rem', color: '#C9AAFF',
            fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap' as const,
          }}>
            Настройки
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </div>
      )}

      {/* Banner */}
      <div style={{
        position: 'relative', borderRadius: '1.6rem', overflow: 'hidden',
        height: '22rem', flexShrink: 0,
        background: 'linear-gradient(135deg, #0d0820 0%, #130d22 50%, #0a0618 100%)',
        border: '1px solid rgba(141,94,244,0.2)',
      }}>
        {/* Background image — always visible */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/redesign/carousel-background.png"
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: 0.75,
          }}
        />

        {/* Left gradient so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,4,16,0.88) 0%, rgba(7,4,16,0.6) 40%, rgba(7,4,16,0.15) 65%, transparent 100%)', zIndex: 1 }} />

        {/* Subtle purple orb behind text */}
        <div style={{ position: 'absolute', left: '-6rem', top: '-6rem', width: '48rem', height: '40rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(141,94,244,0.1) 0%, transparent 65%)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Decoration character — fades between slides */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.decoration}
          alt=""
          style={{
            position: 'absolute', right: 0, zIndex: 2,
            ...current.decorationStyle,
            objectFit: 'contain', pointerEvents: 'none',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.25s ease',
            filter: 'drop-shadow(-12px 0 32px rgba(141,94,244,0.2))',
          }}
        />

        {/* Text content */}
        <div style={{ position: 'relative', zIndex: 3, padding: '3.4rem 4rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase' as const, color: 'rgba(185,153,253,0.7)',
            fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1rem',
          }}>
            Добро пожаловать
          </div>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 3.5vw, 4.8rem)', fontWeight: 700,
            fontFamily: "'Colus', 'Gotham Pro', sans-serif",
            color: '#fff', margin: '0 0 0.8rem', lineHeight: 1.1,
            textShadow: '0 2px 30px rgba(0,0,0,0.7)',
          }}>
            {username}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Gotham Pro', sans-serif" }}>
              Сезон 3 · Бета-тест
            </span>
            {mmr ? (
              <>
                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span style={{ fontSize: '1.3rem', color: 'rgba(185,153,253,0.8)', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600 }}>
                  {mmr} MMR
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Slide dots */}
        <div style={{
          position: 'absolute', bottom: '1.8rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 4,
        }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === slide ? '2.2rem' : '0.65rem',
                height: '0.65rem',
                borderRadius: '0.4rem',
                background: i === slide ? '#C9AAFF' : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
