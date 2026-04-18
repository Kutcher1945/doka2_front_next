'use client'

import { ScrollReveal } from './ScrollReveal'

const TESTIMONIALS = [
  {
    char: 1,
    name: '影丸  KAGEMARU',
    rank: 'Diamond III',
    text: 'Наконец-то честная система подбора. Ни разу не попал на читера за 3 месяца — это что-то невероятное для Dota.',
    stars: 5,
  },
  {
    char: 2,
    name: '雷斬  RAIZAN',
    rank: 'Master I',
    text: 'Вывел 4200 ₽ на карту — деньги пришли буквально за минуту. Никаких комиссий, никаких задержек. Доволен.',
    stars: 5,
  },
  {
    char: 3,
    name: '炎鬼  ENOONI',
    rank: 'Legend II',
    text: 'Репортнул бустера, поддержка разобралась за 2 часа и вернула ставку. Вот так должна работать платформа.',
    stars: 5,
  },
  {
    char: 8,
    name: 'STORMBREAKER',
    rank: 'Immortal',
    text: 'Рейтинговая система реально работает — играю против равных, каждый матч напряжённый. Давно такого не было.',
    stars: 5,
  },
  {
    char: 9,
    name: 'VOID WALKER',
    rank: 'Diamond I',
    text: 'Верификация прошла быстро, интерфейс чистый. Бонус за регистрацию уже на счету — пора играть!',
    stars: 4,
  },
  {
    char: 10,
    name: 'NEON SPECTER',
    rank: 'Legend III',
    text: 'Реферальный бонус — огонь. Позвал трёх друзей, сразу получил плюс на баланс. Советую всем.',
    stars: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section style={{ padding: '9.6rem 0', position: 'relative', overflow: 'hidden' }}>

      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0, pointerEvents:'none' }}
        src="/windrunner_testimonials.mp4"
      />

      {/* Dark overlay so cards remain readable */}
      <div style={{ position:'absolute', inset:0, background:'rgba(5,3,12,0.72)', zIndex:1, pointerEvents:'none' }} />

      {/* Ambient */}
      <div style={{ position:'absolute', top:'20%', left:'-20rem', width:'60rem', height:'60rem', borderRadius:'50%', background:'radial-gradient(circle, rgba(141,94,244,0.06) 0%, transparent 65%)', pointerEvents:'none', zIndex:1 }} />
      <div style={{ position:'absolute', bottom:'10%', right:'-15rem', width:'50rem', height:'50rem', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 65%)', pointerEvents:'none', zIndex:1 }} />

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 2.4rem', boxSizing:'border-box' as const, position:'relative', zIndex:2 }}>

        {/* Title */}
        <ScrollReveal>
          <div style={{ textAlign:'center', marginBottom:'8rem', position:'relative' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'0.8rem',
              background:'rgba(141,94,244,0.12)', border:'1px solid rgba(141,94,244,0.3)',
              borderRadius:'10rem', padding:'0.6rem 1.8rem', marginBottom:'2.4rem',
            }}>
              <div className="anim-pulse-glow" style={{ width:'0.6rem', height:'0.6rem', borderRadius:'50%', background:'#8D5EF4', boxShadow:'0 0 8px #8D5EF4' }} />
              <span style={{ fontSize:'1.3rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#B999FD', fontFamily:"'Gotham Pro', sans-serif" }}>Отзывы игроков</span>
            </div>
            <h2 style={{
              fontSize:'clamp(3.8rem, 5vw, 7rem)', fontWeight:700,
              fontFamily:"'Colus', 'Gotham Pro', sans-serif",
              background:'linear-gradient(135deg, #FFFFFF 0%, #B999FD 50%, #8D5EF4 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              display:'block',
            }}>Что говорят игроки</h2>
            <div style={{ position:'absolute', bottom:'-1.6rem', left:'50%', transform:'translateX(-50%)', width:'12rem', height:'0.4rem', borderRadius:'2px', background:'linear-gradient(90deg,transparent,#8D5EF4,transparent)' }} />
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(30rem, 1fr))',
          gap:'2.4rem',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={i} delay={i * 80} direction="up">
              <TestimonialCard {...t} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ char, name, rank, text, stars }: typeof TESTIMONIALS[0]) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(141,94,244,0.5) 0%, rgba(141,94,244,0.08) 50%, rgba(141,94,244,0.35) 100%)',
      borderRadius: '2.4rem',
      padding: '1.5px',
      boxShadow: '0 8px 48px rgba(141,94,244,0.2)',
    }}>
      <div style={{
        background: 'linear-gradient(175deg, rgba(16,10,28,0.98) 0%, rgba(8,5,16,1) 100%)',
        borderRadius: 'calc(2.4rem - 1.5px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
      }}>

        {/* Avatar area */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '3.2rem 2.4rem 0' }}>
          {/* Glow behind circle */}
          <div style={{ position: 'relative' as const }}>
            <div className="anim-pulse-glow" style={{
              position: 'absolute' as const, inset: '-10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(141,94,244,0.55) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/redesign/landing/characters/character (${char}).png`}
              alt=""
              draggable={false}
              style={{
                width: '16rem',
                height: '16rem',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
                border: '3px solid rgba(141,94,244,0.7)',
                boxShadow: '0 0 32px rgba(141,94,244,0.5), 0 0 80px rgba(141,94,244,0.2)',
                position: 'relative' as const,
              }}
            />
          </div>

          {/* Name + rank + stars */}
          <div style={{ textAlign: 'center' as const, marginTop: '1.8rem' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.05em' }}>{name}</div>
            <div style={{ fontSize: '1.15rem', color: 'rgba(185,153,253,0.8)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.3rem' }}>{rank}</div>
            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginTop: '0.8rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < stars ? '#FFD700' : 'rgba(255,255,255,0.12)'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(141,94,244,0.35), transparent)', margin: '2.4rem 2.4rem 0' }} />

        {/* Text content */}
        <div style={{ padding: '2rem 2.4rem 2.8rem' }}>
          <div style={{ fontSize: '3.2rem', lineHeight: 1, color: 'rgba(141,94,244,0.4)', fontFamily: 'Georgia, serif', marginBottom: '0.8rem' }}>&ldquo;</div>
          <p style={{ fontSize: '1.45rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', fontFamily: "'Gotham Pro', sans-serif", margin: 0 }}>{text}</p>
        </div>

      </div>
    </div>
  )
}
