'use client'

import { ParticlesCanvas } from './ParticlesCanvas'
import { ScrollReveal } from './ScrollReveal'

interface LandingFeaturesProps {
  onSignUp: () => void
}

export function LandingFeatures({ onSignUp }: LandingFeaturesProps) {
  return (
    <section
      id="features"
      style={{ padding: '9.6rem 0', position: 'relative', overflow: 'hidden' }}
    >
      <style>{`
        @media (max-width: 900px) {
          .ftr-feature { flex-direction: column !important; gap: 3rem !important; }
          .ftr-feature.flip { flex-direction: column !important; }
          .ftr-hero-wrap { display: none !important; }
          .ftr-card { max-width: 100% !important; }
        }
      `}</style>

      <ParticlesCanvas count={55} />

      {/* Ambient orbs */}
      <div className="anim-orb" style={{ position:'absolute', top:'-10rem', left:'-15rem', width:'60rem', height:'60rem', borderRadius:'50%', background:'radial-gradient(circle, rgba(141,94,244,0.07) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }} />
      <div className="anim-orb" style={{ position:'absolute', top:'35%', right:'-20rem', width:'70rem', height:'70rem', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)', pointerEvents:'none', zIndex:0, animationDelay:'4s' }} />
      <div className="anim-orb" style={{ position:'absolute', bottom:'5%', left:'-10rem', width:'50rem', height:'50rem', borderRadius:'50%', background:'radial-gradient(circle, rgba(141,94,244,0.05) 0%, transparent 65%)', pointerEvents:'none', zIndex:0, animationDelay:'8s' }} />
      {[15,38,62,85].map(t => (
        <div key={t} style={{ position:'absolute', left:0, right:0, top:`${t}%`, height:'1px', background:'linear-gradient(90deg,transparent,rgba(141,94,244,0.06) 20%,rgba(141,94,244,0.06) 80%,transparent)', pointerEvents:'none', zIndex:0 }} />
      ))}

      <div style={{ maxWidth:'1200px', margin:'0 auto', width:'100%', padding:'0 2.4rem', boxSizing:'border-box' as const, position:'relative', zIndex:1 }}>

        {/* Title */}
        <ScrollReveal>
          <div style={{ textAlign:'center', marginBottom:'10rem', position:'relative' }}>
            <h2 style={{
              fontSize:'clamp(3.8rem, 5vw, 7rem)', fontWeight:700,
              fontFamily:"'Colus', 'Gotham Pro', sans-serif",
              background:'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>С нами ты получишь</h2>
            <div style={{ position:'absolute', bottom:'-1.6rem', left:'50%', transform:'translateX(-50%)', width:'12rem', height:'0.4rem', borderRadius:'2px', background:'linear-gradient(90deg,transparent,#8D5EF4,transparent)' }} />
          </div>
        </ScrollReveal>

        {/* Feature rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8rem', marginBottom:'10rem' }}>

          {/* 1 — Рейтинг */}
          <ScrollReveal direction="left">
            <FeatureRow flip={false} hero="/images/redesign/landing/ftr-1.png" heroGlow="rgba(56,240,180,0.3)" card={<RatingMockup />} title="Рейтинг" text="Справедливую рейтинговую систему — чтобы игра была честной, наша система подбирает противников, равных вам по скиллу." />
          </ScrollReveal>

          {/* 2 — Контроль */}
          <ScrollReveal direction="right">
            <FeatureRow flip={true} hero="/images/redesign/landing/ftr-2.png" heroGlow="rgba(239,68,68,0.3)" card={<ControlMockup />} title="Контроль" text="Контроль игры — наши беспристрастные ребята из службы поддержки обработают каждую жалобу и дадут объективный бан читерам, бустерам и руинерам." />
          </ScrollReveal>

          {/* 3 — Бонусы */}
          <ScrollReveal direction="left">
            <FeatureRow flip={false} hero="/images/redesign/landing/ftr-3.png" heroGlow="rgba(251,146,60,0.3)" card={<BonusMockup />} title="Бонусы" text="Мы поддерживаем активных пользователей и поощряем их бонусами и подарками. За регистрацию, пополнение баланса, реферальный бонус и многое другое." />
          </ScrollReveal>

          {/* 4 — Верификация */}
          <ScrollReveal direction="right">
            <FeatureRow flip={true} hero="/images/redesign/landing/ftr-4.png" heroGlow="rgba(141,94,244,0.4)" card={<VerifyMockup />} title="Верификация" text="Каждый пользователь проходит подтверждение личности — это исключает мультиаккаунты и мошенников." />
          </ScrollReveal>

          {/* 5 — Надёжный вывод */}
          <ScrollReveal direction="left">
            <FeatureRow flip={false} hero="/images/redesign/landing/ftr-5.png" heroGlow="rgba(251,191,36,0.3)" card={<WithdrawMockup />} title="Надёжный вывод" text="Мгновенный вывод средств на карту. Поддерживаем все популярные платёжные системы без скрытых комиссий." />
          </ScrollReveal>

        </div>

        {/* CTA */}
        <ScrollReveal>
          <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
            <button
              onClick={onSignUp}
              style={{
                padding:'1.4rem 4.8rem', borderRadius:'1.2rem',
                fontSize:'2.1rem', fontWeight:600,
                fontFamily:"'Colus', 'Gotham Pro', sans-serif",
                color:'#fff',
                background:'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
                border:'none', cursor:'pointer',
                boxShadow:'0 4px 20px rgba(141,94,244,0.4), 0 8px 40px rgba(141,94,244,0.2)',
                transition:'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 30px rgba(141,94,244,0.55), 0 12px 50px rgba(141,94,244,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(141,94,244,0.4), 0 8px 40px rgba(141,94,244,0.2)' }}
            >
              Создать аккаунт
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─── Feature Row ─── */
function FeatureRow({ flip, hero, heroGlow, card, title, text }: {
  flip: boolean
  hero: string
  heroGlow: string
  card: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className={`ftr-feature${flip ? ' flip' : ''}`} style={{
      display:'flex', flexDirection: flip ? 'row-reverse' : 'row',
      alignItems:'center', gap:'6rem', position:'relative',
    }}>
      {/* Card */}
      <div className="ftr-card" style={{ flex:'1 1 0', minWidth:0, maxWidth:'55rem' }}>
        {/* Neon border wrapper */}
        <div style={{
          borderRadius:'2.4rem',
          padding:'1.5px',
          background:'linear-gradient(135deg, rgba(141,94,244,0.7) 0%, rgba(56,189,248,0.15) 40%, rgba(141,94,244,0.5) 70%, rgba(34,197,94,0.2) 100%)',
          boxShadow:'0 0 24px rgba(141,94,244,0.22), 0 0 60px rgba(141,94,244,0.1), 0 8px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Inner card */}
          <div style={{
            background:'linear-gradient(160deg, rgba(20,14,34,0.97) 0%, rgba(10,8,18,0.99) 100%)',
            borderRadius:'calc(2.4rem - 1.5px)',
            overflow:'hidden',
          }}>
            {/* Mockup area */}
            <div style={{ padding:'2.4rem 2.4rem 0' }}>
              {card}
            </div>
            {/* Text area */}
            <div style={{ padding:'2.4rem 3.2rem 3.2rem' }}>
              <div style={{ width:'4rem', height:'2px', background:'linear-gradient(90deg,#8D5EF4,transparent)', marginBottom:'1.6rem', borderRadius:'2px' }} />
              <h4 style={{ fontFamily:"'Colus', 'Gotham Pro', sans-serif", fontSize:'2.4rem', color:'#fff', margin:'0 0 1rem' }}>{title}</h4>
              <p style={{ fontFamily:"'Gotham Pro', sans-serif", fontSize:'1.4rem', lineHeight:1.6, color:'rgba(255,255,255,0.55)', margin:0 }}>{text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="ftr-hero-wrap" style={{ flex:'0 0 auto', position:'relative', width:'58rem', height:'58rem' }}>
        {/* Ground glow */}
        <div style={{
          position:'absolute', bottom:'1rem', left:'50%', transform:'translateX(-50%)',
          width:'38rem', height:'6rem', borderRadius:'50%',
          background:`radial-gradient(ellipse, ${heroGlow} 0%, transparent 70%)`,
          filter:'blur(14px)', pointerEvents:'none',
        }} />
        {/* Neon halo ring */}
        <div style={{
          position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:'44rem', height:'44rem', borderRadius:'50%',
          background:`radial-gradient(ellipse, ${heroGlow.replace('0.3','0.06').replace('0.4','0.08')} 0%, transparent 65%)`,
          pointerEvents:'none',
        }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="" draggable={false} style={{
          width:'100%', height:'100%', objectFit:'contain',
          transition:'transform 0.4s ease, filter 0.4s ease',
          userSelect:'none',
          filter:`drop-shadow(0 0 18px ${heroGlow.replace('0.3','0.55').replace('0.4','0.65')}) drop-shadow(0 0 40px ${heroGlow.replace('0.3','0.25').replace('0.4','0.3')})`,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06) translateY(-10px)'; e.currentTarget.style.filter=`drop-shadow(0 0 30px ${heroGlow.replace('0.3','0.85').replace('0.4','0.9')}) drop-shadow(0 0 60px ${heroGlow.replace('0.3','0.45').replace('0.4','0.5')})` }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.filter=`drop-shadow(0 0 18px ${heroGlow.replace('0.3','0.55').replace('0.4','0.65')}) drop-shadow(0 0 40px ${heroGlow.replace('0.3','0.25').replace('0.4','0.3')})` }}
        />
      </div>
    </div>
  )
}

/* ─── Mockups ─── */

function RatingMockup() {
  const players = [
    { rank: 1, name: '影丸  KAGEMARU', stars: 5, color: '#FFD700' },
    { rank: 2, name: '雷斬  RAIZAN', stars: 4, color: '#C0C0C0' },
    { rank: 3, name: '炎鬼  ENOONI', stars: 4, color: '#CD7F32' },
  ]
  const medals = ['⬧', '◆', '◈', '◇', '◦']
  return (
    <div style={{ borderRadius:'1.2rem', overflow:'hidden', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(141,94,244,0.25)', boxShadow:'0 0 30px rgba(141,94,244,0.12), inset 0 1px 0 rgba(141,94,244,0.1)' }}>
      {/* Header */}
      <div style={{ padding:'1.2rem 1.6rem', borderBottom:'1px solid rgba(141,94,244,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(141,94,244,0.06)' }}>
        <span style={{ fontSize:'1.1rem', fontWeight:700, letterSpacing:'0.12em', color:'rgba(185,153,253,0.9)', fontFamily:"'Gotham Pro', sans-serif", textTransform:'uppercase' as const }}>Таблица лидеров</span>
        <span style={{ fontSize:'1.1rem', color:'rgba(255,255,255,0.3)', fontFamily:"'Gotham Pro', sans-serif" }}>Сезон 3</span>
      </div>
      {/* Players */}
      {players.map(p => (
        <div key={p.rank} style={{
          display:'flex', alignItems:'center', gap:'1.2rem', padding:'1rem 1.6rem',
          borderBottom:'1px solid rgba(255,255,255,0.04)',
          background: p.rank === 1 ? 'rgba(141,94,244,0.1)' : 'transparent',
        }}>
          <span style={{ fontSize:'1.1rem', fontWeight:700, color:p.color, width:'1.6rem', fontFamily:"'Gotham Pro', sans-serif", textShadow:`0 0 10px ${p.color}` }}>{`#${p.rank}`}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/redesign/landing/characters/character (${p.rank}).png`} alt="" draggable={false} style={{ width:'2.8rem', height:'2.8rem', borderRadius:'50%', objectFit:'cover', flexShrink:0, border:`1px solid ${p.color}66`, boxShadow:`0 0 10px ${p.color}44` }} />
          <span style={{ flex:1, fontSize:'1.3rem', fontWeight:700, color:'#fff', fontFamily:"'Gotham Pro', sans-serif", letterSpacing:'0.05em' }}>{p.name}</span>
          <span style={{ fontSize:'1rem', color:p.color, letterSpacing:'0.1em', textShadow:`0 0 8px ${p.color}` }}>{'★'.repeat(p.stars)}</span>
        </div>
      ))}
      {/* Medal bar */}
      <div style={{ padding:'1.2rem 1.6rem', display:'flex', alignItems:'center', gap:'1.2rem' }}>
        {medals.map((m, i) => (
          <div key={i} style={{ width:'2.8rem', height:'2.8rem', borderRadius:'0.6rem', background:'rgba(141,94,244,0.12)', border:'1px solid rgba(141,94,244,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', color:'rgba(185,153,253,0.9)', boxShadow:'0 0 8px rgba(141,94,244,0.2)' }}>{m}</div>
        ))}
      </div>
      {/* Neon bar */}
      <div style={{ height:'2px', background:'linear-gradient(90deg, transparent, #8D5EF4, #22c55e, transparent)', boxShadow:'0 0 8px rgba(141,94,244,0.6)' }} />
    </div>
  )
}

function ControlMockup() {
  const items = [
    { label: 'CLEAR', color: '#22c55e', glow: 'rgba(34,197,94,0.3)', icon: '✓', char: 5 },
    { label: 'REPORTED', color: '#ef4444', glow: 'rgba(239,68,68,0.35)', icon: '!', char: 6 },
    { label: 'CLEAR', color: '#22c55e', glow: 'rgba(34,197,94,0.3)', icon: '✓', char: 7 },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem', padding:'0.4rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'1rem 1.6rem', borderRadius:'1rem',
          background:`linear-gradient(135deg, ${item.color}12, ${item.color}06)`,
          border:`1px solid ${item.color}30`,
          boxShadow:`0 0 16px ${item.glow}`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem' }}>
            <div style={{ width:'2rem', height:'2rem', borderRadius:'50%', background:`${item.color}22`, border:`1px solid ${item.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:item.color, fontWeight:700 }}>{item.icon}</div>
            <span style={{ fontSize:'1.8rem', fontWeight:900, letterSpacing:'0.15em', color:item.color, fontFamily:"'Gotham Pro', sans-serif" }}>{item.label}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/redesign/landing/characters/character (${item.char}).png`} alt="" draggable={false} style={{ width:'3rem', height:'3rem', borderRadius:'50%', objectFit:'cover', border:`1px solid ${item.color}44`, boxShadow:`0 0 8px ${item.glow}` }} />
        </div>
      ))}
    </div>
  )
}

function BonusMockup() {
  const bonuses = [
    { label: 'За регистрацию', value: '+200 ₽', color: '#8D5EF4' },
    { label: 'Реферальный бонус', value: '+500 ₽', color: '#22c55e' },
    { label: 'За пополнение', value: '+10%', color: '#f59e0b' },
  ]
  return (
    <div style={{ borderRadius:'1.2rem', overflow:'hidden', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding:'1.2rem 1.6rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:'1rem', color:'rgba(255,255,255,0.3)', fontFamily:"'Gotham Pro', sans-serif", marginBottom:'0.4rem' }}>Баланс бонусов</div>
        <div style={{ fontSize:'2.8rem', fontWeight:900, color:'#fff', fontFamily:"'Colus', 'Gotham Pro', sans-serif" }}>1 200 <span style={{ fontSize:'1.6rem', color:'rgba(141,94,244,0.8)' }}>₽</span></div>
      </div>
      {bonuses.map((b, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.9rem 1.6rem', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize:'1.2rem', color:'rgba(255,255,255,0.5)', fontFamily:"'Gotham Pro', sans-serif" }}>{b.label}</span>
          <span style={{ fontSize:'1.4rem', fontWeight:700, color:b.color, fontFamily:"'Gotham Pro', sans-serif" }}>{b.value}</span>
        </div>
      ))}
    </div>
  )
}

function VerifyMockup() {
  return (
    <div style={{ borderRadius:'1.2rem', overflow:'hidden', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)', padding:'2rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'1.6rem', marginBottom:'1.6rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/redesign/landing/characters/character (4).png" alt="" draggable={false} style={{ width:'5.6rem', height:'5.6rem', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(141,94,244,0.5)', flexShrink:0, boxShadow:'0 0 16px rgba(141,94,244,0.4)' }} />
        <div>
          <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', fontFamily:"'Gotham Pro', sans-serif" }}>暁月  AKATSUKI</div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginTop:'0.4rem' }}>
            <div style={{ width:'1.4rem', height:'1.4rem', borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize:'1.1rem', color:'#22c55e', fontFamily:"'Gotham Pro', sans-serif" }}>Верифицирован</span>
          </div>
        </div>
      </div>
      {[
        { label: 'Статус', value: 'Активен' },
        { label: 'Аккаунт', value: 'Уникальный' },
        { label: 'Уровень доверия', value: 'Высокий' },
      ].map((row, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.7rem 0', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize:'1.2rem', color:'rgba(255,255,255,0.35)', fontFamily:"'Gotham Pro', sans-serif" }}>{row.label}</span>
          <span style={{ fontSize:'1.2rem', color:'rgba(185,153,253,0.9)', fontFamily:"'Gotham Pro', sans-serif" }}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function WithdrawMockup() {
  return (
    <div style={{ borderRadius:'1.2rem', overflow:'hidden', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)', padding:'2rem' }}>
      <div style={{ fontSize:'1rem', color:'rgba(255,255,255,0.3)', fontFamily:"'Gotham Pro', sans-serif", marginBottom:'0.6rem' }}>Доступно к выводу</div>
      <div style={{ fontSize:'3rem', fontWeight:900, color:'#fff', fontFamily:"'Colus', 'Gotham Pro', sans-serif", marginBottom:'1.6rem' }}>5 840 <span style={{ fontSize:'1.8rem', color:'rgba(141,94,244,0.8)' }}>₽</span></div>
      <div style={{ display:'flex', gap:'1.2rem', marginBottom:'1.6rem' }}>
        {[
          { src:'/images/redesign/landing/visa.png', alt:'VISA' },
          { src:'/images/redesign/landing/mastercard.png', alt:'Mastercard' },
          { src:'/images/redesign/landing/mir.png', alt:'МИР' },
        ].map(p => (
          <div key={p.alt} style={{ flex:1, padding:'1rem', borderRadius:'1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} style={{ height:'2.4rem', objectFit:'contain', filter:'brightness(0.85)' }} draggable={false} />
          </div>
        ))}
      </div>
      <div style={{ height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div style={{ width:'72%', height:'100%', background:'linear-gradient(90deg, #8D5EF4, #22c55e)', borderRadius:'2px' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.6rem' }}>
        <span style={{ fontSize:'1rem', color:'rgba(255,255,255,0.25)', fontFamily:"'Gotham Pro', sans-serif" }}>Комиссия 0%</span>
        <span style={{ fontSize:'1rem', color:'rgba(34,197,94,0.7)', fontFamily:"'Gotham Pro', sans-serif" }}>Мгновенно</span>
      </div>
    </div>
  )
}
