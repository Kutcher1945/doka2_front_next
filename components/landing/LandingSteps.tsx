'use client'

import { useState, useEffect } from 'react'

export function LandingSteps() {
  const [activeStep, setActiveStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Cycle through steps every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      backgroundImage: 'url(/images/redesign/landing/background-1.png)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom center',
      backgroundAttachment: 'fixed',
      width: '100%',
    }}>

      {/* ── STEPS ── */}
      <section id="steps" style={{ padding: '9.6rem 2.4rem 2.4rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

          {/* Gradient title */}
          <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative' }}>
            <h2 style={{
              fontSize: 'clamp(4rem, 5vw, 7rem)',
              fontWeight: 400,
              fontFamily: "'Colus', 'Gotham Pro', sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Как начать играть
            </h2>
            <div style={{
              position: 'absolute',
              bottom: '-2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12rem',
              height: '0.4rem',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, transparent, #8D5EF4, transparent)',
            }} />
          </div>

          {/* Steps grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 30rem))',
            gap: '8rem',
            justifyContent: 'center',
          }}>
            {STEPS.map((step, i) => {
              const isActive = activeStep === i + 1
              return (
                <div
                  key={step.title}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '4rem 3.5rem',
                    borderRadius: '2rem',
                    background: isActive ? 'rgba(141,94,244,0.15)' : 'rgba(20,20,21,0.3)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isActive ? 'rgba(141,94,244,0.4)' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: isActive ? '0 8px 32px rgba(141,94,244,0.3)' : 'none',
                    transition: 'all 0.6s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)'
                    e.currentTarget.style.background = 'rgba(141,94,244,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(141,94,244,0.3)'
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(141,94,244,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = isActive ? 'rgba(141,94,244,0.15)' : 'rgba(20,20,21,0.3)'
                    e.currentTarget.style.borderColor = isActive ? 'rgba(141,94,244,0.4)' : 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.boxShadow = isActive ? '0 8px 32px rgba(141,94,244,0.3)' : 'none'
                  }}
                >
                  {/* Big step number */}
                  <div style={{
                    fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                    fontSize: '7rem',
                    lineHeight: 1.24,
                    color: isActive ? '#fff' : '#474747',
                    textShadow: isActive ? '0 0 3rem #8D5EF4' : 'none',
                    marginBottom: '0.6rem',
                    transition: 'all 0.6s ease',
                  }}>
                    {i + 1}
                  </div>

                  {/* Dot connector */}
                  <div style={{ width: '100%', position: 'relative', marginBottom: '1.4rem', height: '1.6rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      width: '1.6rem',
                      height: '1.6rem',
                      borderRadius: '50%',
                      background: isActive ? '#9B67CF' : '#474747',
                      boxShadow: isActive ? '0 0 2.5rem #9B67CF' : 'none',
                      transition: 'all 0.6s ease',
                      flexShrink: 0,
                    }} />
                  </div>

                  {/* Step title */}
                  <h6 style={{
                    fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                    fontSize: '2.5rem',
                    lineHeight: 1.3,
                    textAlign: 'center',
                    color: isActive ? '#fff' : '#6B6B6B',
                    textShadow: isActive ? '0 0 2.5rem #9B67CF' : '0 0 2.5rem rgba(155,103,207,0.44)',
                    minHeight: '8rem',
                    marginBottom: '1.2rem',
                    wordWrap: 'break-word',
                    transition: 'all 0.6s ease',
                  }}>
                    {step.title}
                  </h6>

                  {/* Step image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.img}
                    alt={step.title}
                    draggable={false}
                    style={{
                      width: '24.8rem',
                      height: '16.9rem',
                      objectFit: 'contain',
                      userSelect: 'none',
                      filter: isActive
                        ? 'grayscale(0%) brightness(1.1) drop-shadow(0 4px 20px rgba(141,94,244,0.4))'
                        : 'grayscale(100%) brightness(0.4)',
                      transition: 'filter 0.6s ease',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MODES ── */}
      <section style={{ padding: '4.8rem 2.4rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h4 style={{
            fontFamily: "'Colus', 'Gotham Pro', sans-serif",
            fontSize: '2.5rem',
            lineHeight: 1.24,
            textAlign: 'center',
            marginBottom: '4.8rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #B999FD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Играй и выигрывай в режимах
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 28.5rem))',
            gap: '6.4rem',
            justifyContent: 'center',
          }}>
            {MODES.map((mode) => (
              <div
                key={mode.label}
                style={{
                  background: 'linear-gradient(135deg, rgba(141,94,244,0.1) 0%, rgba(185,153,253,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(141,94,244,0.2)',
                  boxShadow: '0 4px 30px rgba(141,94,244,0.2)',
                  borderRadius: '1.6rem',
                  fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                  fontSize: '2.5rem',
                  lineHeight: 1.24,
                  color: '#fff',
                  position: 'relative',
                  padding: '2rem 3rem 2rem 11rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(141,94,244,0.2) 0%, rgba(185,153,253,0.1) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.4)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(141,94,244,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(141,94,244,0.1) 0%, rgba(185,153,253,0.05) 100%)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.2)'
                  e.currentTarget.style.boxShadow = '0 4px 30px rgba(141,94,244,0.2)'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mode.icon}
                  alt=""
                  draggable={false}
                  style={{
                    width: '6rem',
                    height: '7.5rem',
                    position: 'absolute',
                    left: '2rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    filter: 'drop-shadow(0 0 10px rgba(141,94,244,0.3))',
                    transition: 'all 0.3s ease',
                  }}
                />
                {mode.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '4.8rem 2.4rem 13.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

          {/* FAQ Header */}
          <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative' }}>
            {/* Decorative glow behind title */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40rem',
              height: '20rem',
              background: 'radial-gradient(ellipse, rgba(141,94,244,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              {/* Eyebrow label */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.8rem',
                background: 'rgba(141,94,244,0.12)',
                border: '1px solid rgba(141,94,244,0.3)',
                borderRadius: '10rem',
                padding: '0.6rem 1.8rem',
                marginBottom: '2.4rem',
              }}>
                <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#8D5EF4', boxShadow: '0 0 8px #8D5EF4' }} />
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: '#B999FD',
                  fontFamily: "'Gotham Pro', sans-serif",
                }}>Частые вопросы</span>
              </div>
              <h2 style={{
                fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                fontSize: 'clamp(4.8rem, 8vw, 12rem)',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '2rem',
              }}>
                FAQ
              </h2>
              <p style={{
                fontSize: '1.7rem',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: "'Bahnschrift', sans-serif",
                maxWidth: '50rem',
                margin: '0 auto',
                lineHeight: 1.6,
              }}>
                Ответы на самые популярные вопросы о платформе CyberT
              </p>
            </div>
          </div>

          {/* FAQ Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 52rem), 1fr))',
            gap: '1.6rem',
            maxWidth: '116rem',
            margin: '0 auto',
          }}>
            {FAQ.map((item, i) => (
              <div
                key={i}
                style={i === FAQ.length - 1 && FAQ.length % 2 !== 0 ? { gridColumn: '1 / -1', maxWidth: '52rem', margin: '0 auto', width: '100%' } : {}}
              >
                <FaqItem
                  index={i}
                  title={item.title}
                  text={item.text}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

function FaqItem({ index, title, text, isOpen, onToggle }: {
  index: number
  title: string
  text: string
  isOpen: boolean
  onToggle: () => void
}) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <div
      onClick={onToggle}
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, rgba(141,94,244,0.14) 0%, rgba(20,15,35,0.9) 100%)'
          : 'rgba(14,12,22,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isOpen ? 'rgba(141,94,244,0.45)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '2rem',
        padding: '2.8rem 3.2rem',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: isOpen
          ? '0 0 0 1px rgba(141,94,244,0.2), 0 8px 48px rgba(141,94,244,0.18), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 2px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.border = '1px solid rgba(141,94,244,0.25)'
          e.currentTarget.style.background = 'rgba(20,15,35,0.9)'
          e.currentTarget.style.boxShadow = '0 4px 32px rgba(141,94,244,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'
          e.currentTarget.style.background = 'rgba(14,12,22,0.75)'
          e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Glow top-left accent when open */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '12rem',
          height: '12rem',
          background: 'radial-gradient(circle, rgba(141,94,244,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '2rem',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', position: 'relative' }}>
        {/* Number badge */}
        <div style={{
          flexShrink: 0,
          width: '4rem',
          height: '4rem',
          borderRadius: '1rem',
          background: isOpen
            ? 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)'
            : 'rgba(141,94,244,0.12)',
          border: `1px solid ${isOpen ? 'transparent' : 'rgba(141,94,244,0.25)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Colus', sans-serif",
          fontSize: '1.4rem',
          color: isOpen ? '#fff' : 'rgba(141,94,244,0.8)',
          fontWeight: 700,
          boxShadow: isOpen ? '0 4px 16px rgba(141,94,244,0.45)' : 'none',
          transition: 'all 0.35s',
          marginTop: '0.2rem',
        }}>
          {num}
        </div>

        {/* Question text */}
        <span style={{
          flex: 1,
          fontSize: '1.7rem',
          fontWeight: 600,
          color: isOpen ? '#fff' : 'rgba(255,255,255,0.82)',
          transition: 'color 0.3s',
          lineHeight: 1.45,
          fontFamily: "'Gotham Pro', 'Bahnschrift', sans-serif",
          paddingRight: '1rem',
        }}>
          {title}
        </span>

        {/* Toggle icon */}
        <div style={{
          flexShrink: 0,
          width: '3.2rem',
          height: '3.2rem',
          borderRadius: '50%',
          border: `1.5px solid ${isOpen ? 'rgba(141,94,244,0.6)' : 'rgba(255,255,255,0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isOpen ? 'rgba(141,94,244,0.15)' : 'rgba(255,255,255,0.04)',
          transition: 'all 0.35s',
          marginTop: '0.2rem',
        }}>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' }}
          >
            <path d="M2 4L6 8L10 4" stroke={isOpen ? '#B999FD' : 'rgba(255,255,255,0.5)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Answer */}
      <div style={{
        overflow: 'hidden',
        maxHeight: isOpen ? '30rem' : '0',
        transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ paddingLeft: '6rem', paddingTop: '1.6rem' }}>
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(141,94,244,0.4) 0%, rgba(141,94,244,0.05) 100%)',
            marginBottom: '1.6rem',
          }} />
          <p style={{
            fontSize: '1.55rem',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75,
            fontFamily: "'Bahnschrift', sans-serif",
            margin: 0,
          }}>
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { img: '/images/redesign/landing/step-1.png', title: 'Зарегистрируйся' },
  { img: '/images/redesign/landing/step-2.png', title: 'Пройди верификацию' },
  { img: '/images/redesign/landing/step-3.png', title: 'Выбери лобби' },
]

const MODES = [
  { icon: '/images/redesign/landing/mode-1.svg', label: 'Solo mid 1x1' },
  { icon: '/images/redesign/landing/mode-2.svg', label: 'All pick' },
  { icon: '/images/redesign/landing/mode-3.svg', label: 'Captains mode' },
]

const FAQ = [
  {
    title: 'Как пройдет отбор на бета-тест? Как я узнаю, что меня выбрали?',
    text: 'Вы получите уведомление в Телеграме от нашего бота.',
  },
  {
    title: 'Что делать, если в игре я встречу недобросовестного игрока?',
    text: 'Если встретите подозительного игрока, пожалуйтесь на него на нашем сайте в процессе матча или сразу после его завершения. Если окажется, что он мошенничал и использовал читы, деньги за игру вернутся на ваш игровой счет.',
  },
  {
    title: 'Что потребуется для запуска игры?',
    text: 'Потребуется ПК с рекомендованными системными требованиями, хороший интернет и документ, удостоверяющий вашу личность для верификации аккаунта.',
  },
  {
    title: 'Сколько продлится бета-тест?',
    text: 'Бета-тестирование платформы начнется сразу после набора нужного количества игроков и продлится 2 месяца. Точная дата окончания может измениться.',
  },
  {
    title: 'Что будет входить в мои обязанности?',
    text: 'Вам нужно будет играть, соревноваться, выводить средства на карту, находить лаги в системе и сообщать о них нам.',
  },
  {
    title: 'Что будет после бета-теста?',
    text: 'После бета-тестирования состоится открытый запуск соревновательной платформы CyberT для всех желающих.',
  },
  {
    title: 'Как мне вывести бонусные 200 ₽?',
    text: 'Чтобы вывести бонусные 200 ₽, нужно их удвоить: для этого соревнуйтесь с другими пользователями платформы и выигрывайте матчи.',
  },
]
