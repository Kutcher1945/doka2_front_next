'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface HeroBannerProps {
  username: string
  mmr?: number | null
  steamConnected: boolean
}

const SLIDES = [
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration.png',
    eyebrow: 'Сезон 3 · Бета-тест',
    title: 'Поднимай ранг.',
    titleAccent: 'Зарабатывай.',
    subtitle: 'Честный матчмейкинг, очки за победы, нулевая терпимость к читерам.',
    cta: 'Найти лобби',
    ctaHref: '/cabinet/lobby',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-2.png',
    eyebrow: 'Бонусная программа',
    title: 'Приведи друга —',
    titleAccent: 'получи бонус.',
    subtitle: '+500 очков на счёт за каждого реферала. Без ограничений по количеству.',
    cta: 'Узнать подробнее',
    ctaHref: '/cabinet/profile',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-3.png',
    eyebrow: 'Турниры · Скоро',
    title: 'Докажи что',
    titleAccent: 'ты лучший.',
    subtitle: 'Еженедельные турниры с призовым фондом. Регистрация открыта для всех.',
    cta: 'Смотреть турниры',
    ctaHref: '/cabinet/lobby',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-4.png',
    eyebrow: 'Новый сезон',
    title: 'Сезон 4',
    titleAccent: 'уже близко.',
    subtitle: 'Готовься к новым испытаниям. Улучшенный матчмейкинг и новые награды.',
    cta: 'Подготовиться',
    ctaHref: '/cabinet/lobby',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-5.png',
    eyebrow: 'Топ игроки · Сезон 3',
    title: 'Войди в',
    titleAccent: 'элиту.',
    subtitle: 'Таблица лидеров обновляется каждую неделю. Докажи, что ты в числе лучших.',
    cta: 'Смотреть рейтинг',
    ctaHref: '/cabinet/lobby',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-6.png',
    eyebrow: 'Ивент · Ограниченное время',
    title: 'Специальный',
    titleAccent: 'ивент.',
    subtitle: 'Выполняй задания, зарабатывай уникальные награды. Только до конца сезона.',
    cta: 'Участвовать',
    ctaHref: '/cabinet/lobby',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-7.png',
    eyebrow: 'Поддержка · 24/7',
    title: 'Мы всегда',
    titleAccent: 'на связи.',
    subtitle: 'Служба поддержки работает круглосуточно. Любой вопрос решим быстро.',
    cta: 'Написать в поддержку',
    ctaHref: '/cabinet/support',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-8.png',
    eyebrow: 'Безопасность · Верификация',
    title: 'Играй честно,',
    titleAccent: 'побеждай чисто.',
    subtitle: 'Верификация аккаунта защищает тебя от мошенников и обеспечивает честную игру.',
    cta: 'Верифицировать аккаунт',
    ctaHref: '/cabinet/profile',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-9.png',
    eyebrow: 'Вывод средств · Быстро',
    title: 'Выводи выигрыш',
    titleAccent: 'мгновенно.',
    subtitle: 'Вывод на карту или Binance за считанные минуты. Без скрытых комиссий.',
    cta: 'Вывести средства',
    ctaHref: '/cabinet/wallet/withdrawal',
  },
  {
    bg: '/images/redesign/carousel-background.png',
    decoration: '/images/redesign/carousel-decoration-10.png',
    eyebrow: 'Реферальная программа',
    title: 'Зови друзей —',
    titleAccent: 'расти вместе.',
    subtitle: 'Приглашай друзей и получай бонусы за каждую их победу. Чем больше команда — тем больше выигрыш.',
    cta: 'Пригласить друга',
    ctaHref: '/cabinet/profile',
  },
]

const N = SLIDES.length
const DRAG_THRESHOLD = 60 // px to commit a swipe

export function HeroBanner({ username, mmr, steamConnected }: HeroBannerProps) {
  const [slide, setSlide] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<number | null>(null)
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const resetAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current)
    autoTimer.current = setInterval(() => setSlide(s => (s + 1) % N), 6000)
  }, [])

  useEffect(() => {
    resetAuto()
    return () => { if (autoTimer.current) clearInterval(autoTimer.current) }
  }, [resetAuto])

  const goTo = useCallback((i: number) => {
    setSlide(((i % N) + N) % N)
    resetAuto()
  }, [resetAuto])

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStart.current === null) return
    setDragOffset(e.clientX - dragStart.current)
  }

  const onMouseUp = () => {
    if (!isDragging || dragStart.current === null) return
    commitDrag()
  }

  const onMouseLeave = () => {
    if (isDragging) commitDrag()
  }

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStart.current === null) return
    setDragOffset(e.touches[0].clientX - dragStart.current)
  }

  const onTouchEnd = () => commitDrag()

  const commitDrag = () => {
    if (dragStart.current === null) return
    if (dragOffset < -DRAG_THRESHOLD) goTo(slide + 1)
    else if (dragOffset > DRAG_THRESHOLD) goTo(slide - 1)
    setDragOffset(0)
    setIsDragging(false)
    dragStart.current = null
  }

  // Base translateX + live drag offset converted to percent of track width
  const trackWidth = trackRef.current?.offsetWidth ?? 0
  const dragPercent = trackWidth > 0 ? (dragOffset / trackWidth) * 100 : 0
  const basePercent = (slide / N) * 100
  const translatePercent = basePercent - dragPercent

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

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

      {/* Banner wrapper */}
      <div
        style={{
          position: 'relative',
          height: '32rem',
          flexShrink: 0,
          marginTop: '2.4rem',
          clipPath: 'inset(-7rem 0 0 0 round 1.6rem)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Sliding track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            width: `${N * 100}%`,
            height: '100%',
            transform: `translateX(-${translatePercent}%)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {SLIDES.map((s, i) => (
            <div
              key={i}
              style={{
                width: `${100 / N}%`,
                flexShrink: 0,
                position: 'relative',
                height: '100%',
                background: 'linear-gradient(135deg, #0d0820 0%, #130d22 50%, #0a0618 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(141,94,244,0.2)',
              }}
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.bg}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
              />

              {/* Left text gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(7,4,16,0.95) 0%, rgba(7,4,16,0.7) 40%, rgba(7,4,16,0.1) 70%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Purple ambient orb */}
              <div style={{
                position: 'absolute', left: '-6rem', top: '-6rem',
                width: '48rem', height: '40rem', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(141,94,244,0.1) 0%, transparent 65%)',
                pointerEvents: 'none',
              }} />

              {/* Character */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.decoration}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  right: '2rem',
                  bottom: 0,
                  height: '125%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />

              {/* Text content */}
              <div style={{
                position: 'relative', zIndex: 2,
                height: '100%',
                display: 'flex', alignItems: 'center',
                padding: '3rem 4rem',
              }}>
                <div style={{ maxWidth: '52rem' }}>
                  {/* Eyebrow */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                    background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.3)',
                    borderRadius: '10rem', padding: '0.4rem 1.2rem', marginBottom: '1.6rem',
                    width: 'fit-content',
                  }}>
                    <div style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#8D5EF4' }} />
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#B999FD', fontFamily: "'Gotham Pro', sans-serif" }}>
                      {s.eyebrow}
                    </span>
                  </div>

                  {/* Headline */}
                  <div style={{ fontSize: 'clamp(2.4rem, 3vw, 4rem)', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", color: '#fff', lineHeight: 1.1 }}>
                    {s.title}
                  </div>
                  <div style={{
                    fontSize: 'clamp(2.4rem, 3vw, 4rem)', fontWeight: 700,
                    fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                    background: 'linear-gradient(135deg, #B999FD 0%, #8D5EF4 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    lineHeight: 1.1, marginBottom: '1.2rem',
                  }}>
                    {s.titleAccent}
                  </div>
                  <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.5, margin: '0 0 2rem' }}>
                    {s.subtitle}
                  </p>
                  <a
                    href={s.ctaHref}
                    onClick={e => isDragging && Math.abs(dragOffset) > 5 && e.preventDefault()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
                      padding: '0.9rem 2.4rem', borderRadius: '0.9rem',
                      background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
                      color: '#fff', fontSize: '1.3rem', fontWeight: 700,
                      fontFamily: "'Gotham Pro', sans-serif", textDecoration: 'none',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {s.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{
          position: 'absolute', bottom: '1.8rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          zIndex: 10,
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
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
