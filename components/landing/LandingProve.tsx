'use client'

export function LandingProve() {
  return (
    <section
      id="prove"
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', marginBottom: '8rem', width: '100%' }}
    >
      {/* Blurred background video */}
      <video
        autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(3px)', zIndex: 0 }}
      >
        <source src="/video-omen.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(4,3,10,0.78)',
      }} />
      {/* Subtle purple center glow — doesn't compete with text */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(141,94,244,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', userSelect: 'none',
        minHeight: '100vh', padding: '10rem 2.4rem 8rem',
        gap: '6rem', width: '100%', boxSizing: 'border-box',
      }}>

        {/* ── Title block ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
            background: 'rgba(141,94,244,0.12)',
            border: '1px solid rgba(141,94,244,0.3)',
            borderRadius: '10rem', padding: '0.6rem 1.8rem',
          }}>
            <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: '#8D5EF4', boxShadow: '0 0 8px #8D5EF4' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#B999FD', fontFamily: "'Gotham Pro', sans-serif" }}>
              Твоё место здесь
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(3.2rem, 4.5vw, 5.6rem)',
            lineHeight: 1.15,
            fontFamily: "'Colus', 'Gotham Pro', sans-serif",
            textShadow: '0 4px 24px rgba(0,0,0,0.9)',
            margin: 0,
          }}>
            <span style={{ color: '#fff' }}>Докажи, что игра</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #A87FFF 0%, #8D5EF4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(141,94,244,0.6))',
            }}>
              не просто хобби
            </span>
            <br />
            <span style={{ color: '#fff' }}>и трата времени</span>
          </h2>
        </div>

        {/* ── Exclude cards ── */}
        <div style={{ width: '100%', maxWidth: '1100px' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', marginBottom: '2.4rem', justifyContent: 'center' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4))' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'rgba(239,68,68,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>
              нет места
            </span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(239,68,68,0.4), transparent)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.6rem' }}>
            {EXCLUDE_CARDS.map((card) => (
              <ExcludeCard key={card.value} label={card.label} value={card.value} />
            ))}
          </div>
        </div>

        {/* ── Divider "ЗДЕСЬ ЕСТЬ ТЫ!" ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '900px', gap: '2.4rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(141,94,244,0.5))' }} />
          <div style={{ position: 'relative' }}>
            {/* Glow behind text */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '40rem', height: '8rem',
              background: 'radial-gradient(ellipse, rgba(141,94,244,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontSize: 'clamp(4rem, 6vw, 6.4rem)',
              fontFamily: "'Colus', 'Gotham Pro', sans-serif",
              background: 'linear-gradient(135deg, #FFFFFF 0%, #C9AAFF 40%, #8D5EF4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              whiteSpace: 'nowrap' as const,
              position: 'relative',
            }}>
              Здесь есть ты!
            </h2>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(141,94,244,0.5), transparent)' }} />
        </div>

        {/* ── Include cards ── */}
        <div style={{ width: '100%', maxWidth: '1300px', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          {/* 4 regular cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.6rem' }}>
            {INCLUDE_CARDS.filter(c => !c.featured).map((card) => (
              <IncludeCard key={card.value} label={card.label!} value={card.value!} />
            ))}
          </div>
          {/* Featured card — full width at bottom */}
          <FeaturedCard />
        </div>

      </div>
    </section>
  )
}

function ExcludeCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', borderRadius: '1.8rem', padding: '2.8rem 2rem',
        minHeight: '13rem',
        background: 'linear-gradient(160deg, rgba(22,14,14,0.92) 0%, rgba(15,10,10,0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(239,68,68,0.2)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
        e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >
      {/* Red bottom glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)',
      }} />

      {/* Ban icon */}
      <div style={{ marginBottom: '1rem' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5"/>
          <line x1="4.5" y1="4.5" x2="17.5" y2="17.5" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div style={{
        fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.35)', marginBottom: '1rem',
        fontFamily: "'Gotham Pro', sans-serif",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '2.8rem', fontWeight: 700,
        color: 'rgba(239,68,68,0.9)',
        fontFamily: "'Colus', 'Gotham Pro', sans-serif",
        textDecoration: 'line-through',
        textDecorationThickness: '0.25rem',
        textDecorationColor: 'rgba(239,68,68,0.7)',
      }}>
        {value}
      </div>
    </div>
  )
}

function IncludeCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', borderRadius: '1.8rem', padding: '2.8rem 2rem',
        minHeight: '13rem',
        background: 'linear-gradient(160deg, rgba(20,14,32,0.92) 0%, rgba(14,10,24,0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(141,94,244,0.2)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.borderColor = 'rgba(141,94,244,0.5)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(141,94,244,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'rgba(141,94,244,0.2)'
        e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >
      {/* Purple bottom glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(141,94,244,0.6), transparent)',
      }} />

      {/* Check icon */}
      <div style={{ marginBottom: '1rem' }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="rgba(141,94,244,0.5)" strokeWidth="1.5"/>
          <path d="M7 11l3 3 5-5" stroke="rgba(141,94,244,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{
        fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.35)', marginBottom: '1rem',
        fontFamily: "'Gotham Pro', sans-serif",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '2.8rem',
        background: 'linear-gradient(135deg, #B999FD 0%, #8D5EF4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontFamily: "'Colus', 'Gotham Pro', sans-serif",
      }}>
        {value}
      </div>
    </div>
  )
}

function FeaturedCard() {
  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .featured-card { flex-direction: column !important; padding: 3rem 2rem !important; gap: 2.4rem !important; }
        .featured-divider { display: none !important; }
        .featured-steps { flex-wrap: wrap !important; gap: 2.4rem !important; justify-content: center; }
      }
    `}</style>
    <div
      className="featured-card"
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: '4rem',
        textAlign: 'center', borderRadius: '1.8rem', padding: '4rem 6rem',
        background: 'linear-gradient(160deg, rgba(14,10,22,0.97) 0%, rgba(8,6,16,0.99) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(141,94,244,0.35)',
        boxShadow: '0 0 0 1px rgba(141,94,244,0.08), 0 8px 60px rgba(141,94,244,0.25), inset 0 1px 0 rgba(141,94,244,0.12)',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box' as const,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(141,94,244,0.15), 0 16px 80px rgba(141,94,244,0.4), inset 0 1px 0 rgba(141,94,244,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(141,94,244,0.35)'
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(141,94,244,0.08), 0 8px 60px rgba(141,94,244,0.25), inset 0 1px 0 rgba(141,94,244,0.12)'
      }}
    >
      {/* Purple glow left */}
      <div style={{
        position: 'absolute', top: '50%', left: '-10rem',
        transform: 'translateY(-50%)',
        width: '40rem', height: '20rem',
        background: 'radial-gradient(ellipse, rgba(141,94,244,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Purple glow right */}
      <div style={{
        position: 'absolute', top: '50%', right: '-10rem',
        transform: 'translateY(-50%)',
        width: '40rem', height: '20rem',
        background: 'radial-gradient(ellipse, rgba(141,94,244,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(141,94,244,0.6), transparent)',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{
          fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: 'rgba(185,153,253,0.6)',
          fontFamily: "'Gotham Pro', sans-serif",
        }}>
          Готовый быть частью
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="CyberT"
          style={{
            height: '6rem', width: 'auto',
            filter: 'drop-shadow(0 0 20px rgba(141,94,244,0.7))',
          }}
        />
      </div>

      <div className="featured-divider" style={{ position: 'relative', width: '1px', height: '6rem', background: 'linear-gradient(180deg, transparent, rgba(141,94,244,0.5), transparent)' }} />

      <div className="featured-steps" style={{ position: 'relative', display: 'flex', gap: '6rem' }}>
        {[
          { label: 'Регистрируйся', icon: '01' },
          { label: 'Играй и зарабатывай', icon: '02' },
          { label: 'Становись лучше', icon: '03' },
        ].map((step) => (
          <div key={step.icon} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '4rem', height: '4rem', borderRadius: '50%',
              background: 'rgba(141,94,244,0.15)',
              border: '1px solid rgba(141,94,244,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700,
              color: 'rgba(185,153,253,0.9)',
              fontFamily: "'Gotham Pro', sans-serif",
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: '1.3rem', fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'Gotham Pro', sans-serif",
              whiteSpace: 'nowrap' as const,
            }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

const EXCLUDE_CARDS = [
  { label: 'Здесь нет места', value: 'ливерам' },
  { label: 'Здесь нет места', value: 'смурфам' },
  { label: 'Здесь нет места', value: 'читерам' },
  { label: 'Здесь нет места', value: 'руинерам' },
]

const INCLUDE_CARDS: { label?: string; value?: string; featured?: boolean }[] = [
  { label: 'Готовый монетизировать свой', value: 'скилл' },
  { label: 'Готовый получать', value: 'бонусы' },
  { label: 'Готовый получать', value: 'призы' },
  { label: 'Готовый сражаться за', value: 'победу!' },
]
