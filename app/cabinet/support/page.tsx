'use client'

import { useState } from 'react'

const FAQ = [
  {
    q: 'Как начать играть?',
    a: 'Зарегистрируйтесь, подключите Steam аккаунт в настройках профиля, затем найдите или создайте лобби. Очки начисляются за победы.',
  },
  {
    q: 'Как работает вывод средств?',
    a: 'После победы очки зачисляются на счёт. Следите за своим рейтингом и балансом очков в разделе «Кошелёк».',
  },
  {
    q: 'Почему нужно подключать Steam?',
    a: 'Steam необходим для приглашения в лобби Dota 2. Наш бот использует ваш Steam ID, чтобы отправить приглашение.',
  },
  {
    q: 'Что такое плавающая комиссия?',
    a: 'Комиссия снижается с каждой игрой: 15% (0–2 игры), 10% (3–5 игр), 5% (6+ игр). Счётчик сбрасывается после каждого вывода.',
  },
  {
    q: 'Что делать если бот не пригласил в лобби?',
    a: 'Убедитесь что ваш Steam профиль открыт и принимает инвайты. Если проблема сохраняется — свяжитесь с поддержкой.',
  },
]

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
          Поддержка
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
          Мы всегда готовы помочь
        </p>
      </div>

      {/* Contact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
        <ContactCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          }
          iconColor="#C9AAFF"
          iconBg="rgba(141,94,244,0.12)"
          title="Email"
          desc="Напишите нам — отвечаем в течение 24 часов."
          action="cybert.helper@gmail.com"
          href="mailto:cybert.helper@gmail.com"
        />
        <ContactCard
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          }
          iconColor="#38bdf8"
          iconBg="rgba(56,189,248,0.1)"
          title="Telegram"
          desc="Оперативная поддержка — ответим быстро."
          action="@cybert_support"
          href="https://t.me/cybert_support"
        />
      </div>

      {/* FAQ */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
            Частые вопросы
          </div>
        </div>
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.8rem 2.4rem', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left' as const, gap: '2rem',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 600, color: open === i ? '#C9AAFF' : '#fff', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.4, transition: 'color 0.2s' }}>
                {item.q}
              </span>
              <div style={{
                width: '2.8rem', height: '2.8rem', borderRadius: '50%', flexShrink: 0,
                background: open === i ? 'rgba(141,94,244,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${open === i ? 'rgba(141,94,244,0.4)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: open === i ? '#C9AAFF' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s',
                transform: open === i ? 'rotate(45deg)' : 'none',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            </button>
            {open === i && (
              <div style={{ padding: '0 2.4rem 1.8rem', fontSize: '1.35rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactCard({ icon, iconColor, iconBg, title, desc, action, href }: {
  icon: React.ReactNode; iconColor: string; iconBg: string
  title: string; desc: string; action: string; href: string
}) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1.4rem', padding: '2.4rem',
      display: 'flex', flexDirection: 'column', gap: '1.2rem',
    }}>
      <div style={{ width: '5rem', height: '5rem', borderRadius: '1.2rem', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif", margin: '0 0 0.4rem' }}>{title}</h3>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.6 }}>{desc}</p>
      </div>
      <a href={href} style={{ fontSize: '1.3rem', fontWeight: 600, color: iconColor, fontFamily: "'Gotham Pro', sans-serif", textDecoration: 'none' }}>
        {action} →
      </a>
    </div>
  )
}
