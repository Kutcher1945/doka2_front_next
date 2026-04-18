'use client'

import { useState } from 'react'
import { ParticlesCanvas } from './ParticlesCanvas'

const CHANNELS = [
  {
    name: 'Telegram',
    handle: '@Cybertgames',
    desc: 'Новости, анонсы и поддержка',
    href: 'https://t.me/Cybertgames',
    color: '#29b6f6',
    glow: 'rgba(41,182,246,0.35)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.91c-.12.57-.47.7-.95.44l-2.62-1.93-1.27 1.22c-.14.14-.26.26-.53.26l.19-2.67 4.87-4.39c.21-.19-.05-.29-.33-.1L7.35 14.27l-2.56-.8c-.56-.17-.57-.56.12-.83l10-3.86c.46-.17.87.11.73.02z"/>
      </svg>
    ),
  },
  {
    name: 'Discord',
    handle: 'discord.gg/6VSkWvRJ',
    desc: 'Общайся с сообществом',
    href: 'https://discord.gg/6VSkWvRJ',
    color: '#5865f2',
    glow: 'rgba(88,101,242,0.35)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.32 4.37A19.8 19.8 0 0 0 15.65 3c-.19.33-.4.78-.55 1.13a18.3 18.3 0 0 0-6.2 0C8.74 3.78 8.52 3.33 8.34 3A19.7 19.7 0 0 0 3.67 4.37C.53 9.1-.32 13.7.1 18.24a19.97 19.97 0 0 0 6.07 3.07c.49-.66.92-1.37 1.3-2.1a12.97 12.97 0 0 1-2.04-.99c.17-.12.34-.25.5-.38a14.3 14.3 0 0 0 12.14 0c.16.13.33.26.5.38-.65.38-1.33.71-2.05.99.37.73.81 1.44 1.3 2.1a19.9 19.9 0 0 0 6.08-3.07c.5-5.17-.85-9.72-3.58-13.87zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.43s.96-2.43 2.16-2.43c1.21 0 2.18 1.09 2.16 2.43 0 1.34-.95 2.43-2.16 2.43zm7.96 0c-1.18 0-2.16-1.09-2.16-2.43s.96-2.43 2.16-2.43c1.2 0 2.17 1.09 2.16 2.43 0 1.34-.94 2.43-2.16 2.43z"/>
      </svg>
    ),
  },
  {
    name: 'VK',
    handle: 'vk.com/cybert.online',
    desc: 'Группа ВКонтакте',
    href: 'https://vk.com/cybert.online',
    color: '#4a76a8',
    glow: 'rgba(74,118,168,0.35)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.56h-1.7c-.64 0-.84-.51-1.99-1.67-1-.99-1.44-.84-1.44-.84s-.18.18-.18.72v1.52c0 .32-.1.51-1.05.51-1.54 0-3.25-.93-4.45-2.67C5.7 10.8 5.25 8.4 5.25 8.4s-.12-.32.18-.32h1.7c.51 0 .7.32.81.67 0 0 .89 3.24 2.13 3.24.41 0 .56-.38.56-1.24V8.93c0-.64-.5-.74-.5-1.24 0-.27.22-.51.57-.51h2.68c.44 0 .57.22.57.7v3.39c0 .44.19.57.32.57.41 0 .76-.45 1.77-1.51 1.09-1.18 1.88-3.01 1.88-3.01s.22-.51.76-.51h1.7c.51 0 .63.26.51.7 0 0-.76 2.61-2.71 4.6-.64.64-.64.84 0 1.47l1.86 1.7c.57.5.51.83-.1.83z"/>
      </svg>
    ),
  },
  {
    name: 'Email',
    handle: 'cybert.helper@gmail.com',
    desc: 'Напиши нам напрямую',
    href: 'mailto:cybert.helper@gmail.com',
    color: '#8D5EF4',
    glow: 'rgba(141,94,244,0.35)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
]

export function LandingContact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setToast(true)
      setName(''); setEmail(''); setMessage('')
      setTimeout(() => setToast(false), 4000)
    }, 1200)
  }

  return (
    <section style={{ padding: '9.6rem 2.4rem', position: 'relative', overflow: 'hidden' }}>

      <ParticlesCanvas count={50} />

      {/* Ambient bg */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80rem', height: '40rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(141,94,244,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(141,94,244,0.3) 50%, transparent)' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '6.4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 1.4rem', borderRadius: '2rem', background: 'rgba(141,94,244,0.1)', border: '1px solid rgba(141,94,244,0.25)', marginBottom: '2rem' }}>
            <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#8D5EF4', boxShadow: '0 0 8px rgba(141,94,244,0.8)' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(185,153,253,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Поддержка</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(3.8rem, 5vw, 6.4rem)', fontWeight: 700, margin: '0 0 1.6rem',
            fontFamily: "'Colus', 'Gotham Pro', sans-serif",
            background: 'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Связаться с нами</h2>
          <p style={{ fontSize: '1.6rem', color: 'rgba(255,255,255,0.4)', maxWidth: '52rem', margin: '0 auto', lineHeight: 1.7 }}>
            Есть вопросы? Мы всегда на связи — выбери удобный канал
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          {CHANNELS.map((ch) => (
            <a
              key={ch.name}
              href={ch.href}
              target={ch.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', gap: '1.6rem',
                padding: '2.8rem', borderRadius: '2rem', textDecoration: 'none',
                background: 'linear-gradient(160deg, rgba(15,14,26,0.95) 0%, rgba(10,8,18,0.98) 100%)',
                border: `1px solid ${ch.color}28`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${ch.color}15`,
                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 30px ${ch.glow}, inset 0 1px 0 ${ch.color}30`
                e.currentTarget.style.borderColor = `${ch.color}55`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${ch.color}15`
                e.currentTarget.style.borderColor = `${ch.color}28`
              }}
            >
              {/* Corner glow */}
              <div style={{ position: 'absolute', top: '-4rem', right: '-4rem', width: '18rem', height: '18rem', borderRadius: '50%', background: `radial-gradient(ellipse, ${ch.glow.replace('0.35', '0.08')} 0%, transparent 70%)`, pointerEvents: 'none' }} />

              {/* Icon */}
              <div style={{
                width: '5.6rem', height: '5.6rem', borderRadius: '1.4rem',
                background: `linear-gradient(135deg, ${ch.color}22, ${ch.color}10)`,
                border: `1px solid ${ch.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: ch.color,
                boxShadow: `0 0 20px ${ch.glow.replace('0.35', '0.2')}`,
                flexShrink: 0,
              }}>
                {ch.icon}
              </div>

              {/* Text */}
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", marginBottom: '0.4rem' }}>{ch.name}</div>
                <div style={{ fontSize: '1.3rem', color: ch.color, fontWeight: 600, marginBottom: '0.6rem', fontFamily: 'monospace' }}>{ch.handle}</div>
                <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{ch.desc}</div>
              </div>

              {/* Arrow */}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', color: `${ch.color}99`, fontSize: '1.2rem', fontWeight: 600 }}>
                Открыть
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem',
          padding: '2.8rem 3.6rem', borderRadius: '2rem',
          background: 'linear-gradient(135deg, rgba(141,94,244,0.1) 0%, rgba(96,64,212,0.06) 100%)',
          border: '1px solid rgba(141,94,244,0.2)',
          boxShadow: '0 0 40px rgba(141,94,244,0.08)',
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", marginBottom: '0.4rem' }}>Служба поддержки</div>
            <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)' }}>Отвечаем в течение 24 часов · 7 дней в неделю</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.8)' }} />
              <span style={{ fontSize: '1.3rem', color: '#22c55e', fontWeight: 600 }}>Онлайн сейчас</span>
            </div>
            <a
              href="mailto:cybert.helper@gmail.com"
              style={{
                padding: '1.2rem 2.8rem', borderRadius: '1.2rem', textDecoration: 'none',
                background: 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
                color: '#fff', fontSize: '1.5rem', fontWeight: 700,
                fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(141,94,244,0.4)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(141,94,244,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(141,94,244,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Написать нам
            </a>
          </div>
        </div>

        {/* Contact form */}
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Left: info */}
          <div style={{ padding: '3.2rem', borderRadius: '2rem', background: 'linear-gradient(160deg, rgba(15,14,26,0.95) 0%, rgba(10,8,18,0.98) 100%)', border: '1px solid rgba(141,94,244,0.2)', boxShadow: '0 0 30px rgba(141,94,244,0.08)' }}>
            <div style={{ width: '4rem', height: '2px', background: 'linear-gradient(90deg, #8D5EF4, transparent)', marginBottom: '2rem', borderRadius: '2px' }} />
            <h3 style={{ fontSize: '2.8rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: '0 0 1.2rem' }}>Напишите нам</h3>
            <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: '0 0 3.2rem' }}>
              Опишите вашу проблему или задайте вопрос — мы ответим в течение 24 часов на указанный email.
            </p>
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ),
                title: 'Быстрый ответ', desc: 'В течение 24 часов',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                title: 'Конфиденциально', desc: 'Данные защищены',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
                title: 'Мультиязычно', desc: 'RU / EN / KZ',
              },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', marginBottom: '1.8rem' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', background: 'rgba(141,94,244,0.1)', border: '1px solid rgba(141,94,244,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8D5EF4', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{item.title}</div>
                  <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.35)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: form */}
          <form onSubmit={handleSubmit} style={{ padding: '3.2rem', borderRadius: '2rem', background: 'linear-gradient(160deg, rgba(15,14,26,0.95) 0%, rgba(10,8,18,0.98) 100%)', border: '1.5px solid rgba(141,94,244,0.25)', boxShadow: '0 0 30px rgba(141,94,244,0.1)', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Имя</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ваше имя" required
                  style={{ padding: '1.3rem 1.6rem', borderRadius: '1.2rem', fontSize: '1.4rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' as const, width: '100%' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  style={{ padding: '1.3rem 1.6rem', borderRadius: '1.2rem', fontSize: '1.4rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' as const, width: '100%' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Сообщение</label>
              <textarea
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Опишите ваш вопрос..." required rows={5}
                style={{ padding: '1.3rem 1.6rem', borderRadius: '1.2rem', fontSize: '1.4rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', resize: 'vertical' as const, minHeight: '14rem', boxSizing: 'border-box' as const, width: '100%' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            <button
              type="submit" disabled={sending}
              style={{
                padding: '1.6rem', borderRadius: '1.4rem', border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                background: sending ? 'rgba(141,94,244,0.4)' : 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
                color: '#fff', fontSize: '1.6rem', fontWeight: 700,
                fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                boxShadow: sending ? 'none' : '0 4px 24px rgba(141,94,244,0.4)',
                transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!sending) { e.currentTarget.style.boxShadow = '0 8px 36px rgba(141,94,244,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = sending ? 'none' : '0 4px 24px rgba(141,94,244,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {!sending && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)', pointerEvents: 'none' }} />}
              {sending ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Отправка...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Отправить сообщение
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Success toast */}
      <div style={{
        position: 'fixed', bottom: '3rem', right: '3rem', zIndex: 99999,
        display: 'flex', alignItems: 'center', gap: '1.2rem',
        padding: '1.6rem 2.4rem', borderRadius: '1.6rem',
        background: 'linear-gradient(135deg, rgba(15,14,26,0.98) 0%, rgba(10,8,18,0.99) 100%)',
        border: '1.5px solid rgba(34,197,94,0.4)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.15)',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: toast ? 'translateY(0) scale(1)' : 'translateY(8rem) scale(0.9)',
        opacity: toast ? 1 : 0,
        pointerEvents: toast ? 'all' : 'none',
      }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', fontFamily: "'Colus', 'Gotham Pro', sans-serif" }}>Сообщение отправлено!</div>
          <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>Мы ответим в течение 24 часов</div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </section>
  )
}
