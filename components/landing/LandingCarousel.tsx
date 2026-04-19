'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ScrollReveal } from './ScrollReveal'

const SLIDES = [
  {
    decoration: '/images/redesign/carousel-decoration.png',
    eyebrow: 'Сезон 3 · Бета-тест',
    title: 'Поднимай ранг.',
    titleAccent: 'Зарабатывай.',
    subtitle: 'Честный матчмейкинг, очки за победы, нулевая терпимость к читерам.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-2.png',
    eyebrow: 'Бонусная программа',
    title: 'Приведи друга —',
    titleAccent: 'получи бонус.',
    subtitle: '+500 очков на счёт за каждого реферала. Без ограничений по количеству.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-3.png',
    eyebrow: 'Турниры · Скоро',
    title: 'Докажи что',
    titleAccent: 'ты лучший.',
    subtitle: 'Еженедельные турниры с призовым фондом. Регистрация открыта для всех.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-4.png',
    eyebrow: 'Новый сезон',
    title: 'Сезон 4',
    titleAccent: 'уже близко.',
    subtitle: 'Готовься к новым испытаниям. Улучшенный матчмейкинг и новые награды.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-5.png',
    eyebrow: 'Топ игроки · Сезон 3',
    title: 'Войди в',
    titleAccent: 'элиту.',
    subtitle: 'Таблица лидеров обновляется каждую неделю. Докажи, что ты в числе лучших.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-6.png',
    eyebrow: 'Ивент · Ограниченное время',
    title: 'Специальный',
    titleAccent: 'ивент.',
    subtitle: 'Выполняй задания, зарабатывай уникальные награды. Только до конца сезона.',
  },
  {
    decoration: '/images/redesign/carousel-decoration-7.png',
    eyebrow: 'Поддержка · 24/7',
    title: 'Мы всегда',
    titleAccent: 'на связи.',
    subtitle: 'Служба поддержки работает круглосуточно. Любой вопрос решим быстро.',
  },
]

const N = SLIDES.length
const DRAG_THRESHOLD = 50
const CARD_HEIGHT = '36rem'
const CHAR_OVERFLOW = '14rem'
const GAP = 20 // px between cards

interface LandingCarouselProps {
  onSignUp: () => void
}

export function LandingCarousel({ onSignUp }: LandingCarouselProps) {
  const [slide, setSlide] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<number | null>(null)
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setContainerWidth(e.contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const resetAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current)
    autoTimer.current = setInterval(() => setSlide(s => (s + 1) % N), 5000)
  }, [])

  useEffect(() => {
    resetAuto()
    return () => { if (autoTimer.current) clearInterval(autoTimer.current) }
  }, [resetAuto])

  const goTo = useCallback((i: number) => {
    setSlide(((i % N) + N) % N)
    resetAuto()
  }, [resetAuto])

  const onMouseDown = (e: React.MouseEvent) => { dragStart.current = e.clientX; setIsDragging(true); setDragOffset(0) }
  const onMouseMove = (e: React.MouseEvent) => { if (!isDragging || dragStart.current === null) return; setDragOffset(e.clientX - dragStart.current) }
  const onMouseUp = () => { if (isDragging) commitDrag() }
  const onMouseLeave = () => { if (isDragging) commitDrag() }
  const onTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientX; setIsDragging(true); setDragOffset(0) }
  const onTouchMove = (e: React.TouchEvent) => { if (dragStart.current === null) return; setDragOffset(e.touches[0].clientX - dragStart.current) }
  const onTouchEnd = () => commitDrag()

  const commitDrag = () => {
    if (dragStart.current === null) return
    if (dragOffset < -DRAG_THRESHOLD) goTo(slide + 1)
    else if (dragOffset > DRAG_THRESHOLD) goTo(slide - 1)
    setDragOffset(0); setIsDragging(false); dragStart.current = null
  }

  // 3 full cards visible; active card is centered
  const slideWidth = containerWidth > 0 ? (containerWidth - 2 * GAP) / 3 : 0
  const peekOffset = (containerWidth - slideWidth) / 2
  const translateX = containerWidth > 0
    ? -(slide * (slideWidth + GAP)) + peekOffset + dragOffset
    : 0

  return (
    <section style={{ padding: '9.6rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '-10rem', width: '50rem', height: '50rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(141,94,244,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-10rem', width: '50rem', height: '50rem', borderRadius: '50%', background: 'radial-gradient(circle, rgba(141,94,244,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Heading — stays centered */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.4rem', boxSizing: 'border-box' as const }}>
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative' }}>
            <h2 style={{
              fontSize: 'clamp(3.8rem, 5vw, 7rem)', fontWeight: 700,
              fontFamily: "'Colus', 'Gotham Pro', sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: 0,
            }}>Всё в одном месте</h2>
            <div style={{ position: 'absolute', bottom: '-1.6rem', left: '50%', transform: 'translateX(-50%)', width: '12rem', height: '0.4rem', borderRadius: '2px', background: 'linear-gradient(90deg,transparent,#8D5EF4,transparent)' }} />
          </div>
        </ScrollReveal>
      </div>

      {/* Carousel — full viewport width, cards go edge to edge */}
      <ScrollReveal>
        {/*
          clip-path: inset(-CHAR_OVERFLOW 0 0 0) —
          negative top lets characters overflow above,
          0 on sides clips far-away slides at screen edge
        */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            clipPath: `inset(-${CHAR_OVERFLOW} 0 0 0)`,
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
            <div style={{
              display: 'flex',
              gap: `${GAP}px`,
              height: CARD_HEIGHT,
              transform: `translateX(${translateX}px)`,
              transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
              alignItems: 'flex-end',
            }}>
              {SLIDES.map((s, i) => {
                const dist = Math.abs(i - slide)
                const isActive = dist === 0
                const isAdjacent = dist === 1
                const cardScale = isActive ? 1 : isAdjacent ? 0.93 : 0.86
                const cardOpacity = isActive ? 1 : isAdjacent ? 0.6 : 0.25
                return (
                  <div
                    key={i}
                    style={{
                      width: `${slideWidth}px`,
                      height: CARD_HEIGHT,
                      flexShrink: 0,
                      position: 'relative',
                      borderRadius: '2.4rem',
                      overflow: 'visible',
                      transform: `scale(${cardScale})`,
                      transformOrigin: 'bottom center',
                      opacity: cardOpacity,
                      transition: isDragging ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
                      boxShadow: isActive
                        ? '0 0 0 1.5px rgba(141,94,244,0.65), 0 0 40px rgba(141,94,244,0.22), 0 16px 60px rgba(0,0,0,0.7)'
                        : '0 0 0 1px rgba(141,94,244,0.18)',
                    }}
                  >
                    {/* Inner — clips bg to border-radius */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '2.4rem', overflow: 'hidden',
                      background: 'linear-gradient(135deg, #0d0820 0%, #130d22 50%, #0a0618 100%)',
                    }}>
                      {/* Background image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/redesign/carousel-background.png"
                        alt=""
                        draggable={false}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, pointerEvents: 'none' }}
                      />
                      {/* Left gradient */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,4,16,0.95) 0%, rgba(7,4,16,0.7) 40%, rgba(7,4,16,0.1) 70%, transparent 100%)', pointerEvents: 'none' }} />
                      {/* Gradient at bottom-right so character blends in */}
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 110%, rgba(141,94,244,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    </div>

                    {/* Purple ambient orb */}
                    <div style={{
                      position: 'absolute', left: '-6rem', top: '-6rem',
                      width: '48rem', height: '40rem', borderRadius: '50%',
                      background: 'radial-gradient(ellipse, rgba(141,94,244,0.1) 0%, transparent 65%)',
                      pointerEvents: 'none', zIndex: 0,
                    }} />

                    {/* Character — overflows above card, shown via clip-path on outer container */}
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
                        objectPosition: 'bottom right',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 2,
                      }}
                    />

                    {/* Text */}
                    <div style={{
                      position: 'relative', zIndex: 3,
                      height: '100%',
                      display: 'flex', alignItems: 'center',
                      padding: '2.4rem 3rem',
                      paddingRight: '42%',
                    }}>
                      <div>
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
                        <div style={{ fontSize: 'clamp(2rem, 2.2vw, 3.2rem)', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", color: '#fff', lineHeight: 1.1 }}>
                          {s.title}
                        </div>
                        <div style={{
                          fontSize: 'clamp(2rem, 2.2vw, 3.2rem)', fontWeight: 700,
                          fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                          background: 'linear-gradient(135deg, #B999FD 0%, #8D5EF4 100%)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                          lineHeight: 1.1, marginBottom: '1.4rem',
                        }}>
                          {s.titleAccent}
                        </div>
                        <p style={{ fontSize: '1.35rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.5, margin: '0 0 2.4rem', maxWidth: '36rem' }}>
                          {s.subtitle}
                        </p>
                        <button
                          onClick={e => { e.stopPropagation(); onSignUp() }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
                            padding: '1rem 2.8rem', borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
                            color: '#fff', fontSize: '1.35rem', fontWeight: 700,
                            fontFamily: "'Gotham Pro', sans-serif", border: 'none', cursor: 'pointer',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Начать играть
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Dots */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              marginTop: '2rem',
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
        </ScrollReveal>
    </section>
  )
}
