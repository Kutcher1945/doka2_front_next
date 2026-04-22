export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ position: 'relative', padding: '6.4rem 2.4rem', background: 'rgba(0,0,0,0.6)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '5%',
        right: '5%',
        height: '1px',
        background: 'linear-gradient(90deg, rgba(141,94,244,0) 0%, rgba(141,94,244,0.6) 50%, rgba(141,94,244,0) 100%)',
      }} />

      {/* Character rising from bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: '4%',
        width: '28rem',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {/* Glow orb under char */}
        <div style={{
          position: 'absolute',
          bottom: '-4rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28rem',
          height: '28rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(141,94,244,0.25) 0%, transparent 65%)',
        }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/redesign/carousel-decoration-6.png"
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom',
            filter: 'drop-shadow(0 0 20px rgba(141,94,244,0.35))',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0.3) 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0.3) 75%, transparent 100%)',
          }}
        />
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '4rem',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left — legal */}
        <div style={{ flex: '1 1 300px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', marginBottom: '2rem' }}>
            <span style={{
              padding: '0.4rem 1.2rem',
              borderRadius: '0.8rem',
              fontSize: '2.8rem',
              fontWeight: 700,
              color: '#8D5EF4',
              border: '1px solid rgba(141,94,244,0.4)',
              background: 'rgba(141,94,244,0.1)',
              textShadow: '0 0 10px rgba(141,94,244,0.5)',
            }}>18+</span>
            <p style={{ fontSize: '1.3rem', color: '#aaa', lineHeight: 1.6 }}>
              Для использования полного функционала соревновательной платформы CyberT вам должно быть 18+
            </p>
          </div>
          <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.9, marginBottom: '1.6rem' }}>
            LTD &ldquo;ONTOORG ORARIOGRAN&rdquo;, Boumpoulinas,<br />
            1, BOUBOULINAS, 3rd floor, Flat/Office 31<br />
            1060, Nicosia, Cyprus
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {[
              { href: '/docs#termsOfUse', label: 'Пользовательское соглашение' },
              { href: '/docs#privacyPolicy', label: 'Политика конфиденциальности' },
              { href: '/docs#aml', label: 'AML политика' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ fontSize: '1.4rem', color: '#8D5EF4', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#B999FD' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#8D5EF4' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right — logo + contact + social */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="CyberT"
            style={{ height: '40px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(141,94,244,0.3))' }}
          />
          <a
            href="mailto:cybert.helper@gmail.com"
            style={{ fontSize: '1.5rem', color: '#878787', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#B999FD' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#878787' }}
          >
            cybert.helper@gmail.com
          </a>

          <div style={{ display: 'flex', gap: '1.2rem' }}>
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  background: 'rgba(141,94,244,0.1)',
                  border: '1px solid rgba(141,94,244,0.3)',
                  color: 'rgba(185,153,253,0.8)',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(141,94,244,0.3)'
                  e.currentTarget.style.color = 'rgba(185,153,253,0.8)'
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p style={{ fontSize: '1.2rem', color: '#444' }}>© {year} CyberT. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

const SOCIALS = [
  {
    name: 'VK', href: 'https://vk.com/cybert.online',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.56h-1.7c-.64 0-.84-.51-1.99-1.67-1-.99-1.44-.84-1.44-.84s-.18.18-.18.72v1.52c0 .32-.1.51-1.05.51-1.54 0-3.25-.93-4.45-2.67C5.7 10.8 5.25 8.4 5.25 8.4s-.12-.32.18-.32h1.7c.51 0 .7.32.81.67 0 0 .89 3.24 2.13 3.24.41 0 .56-.38.56-1.24V8.93c0-.64-.5-.74-.5-1.24 0-.27.22-.51.57-.51h2.68c.44 0 .57.22.57.7v3.39c0 .44.19.57.32.57.41 0 .76-.45 1.77-1.51 1.09-1.18 1.88-3.01 1.88-3.01s.22-.51.76-.51h1.7c.51 0 .63.26.51.7 0 0-.76 2.61-2.71 4.6-.64.64-.64.84 0 1.47l1.86 1.7c.57.5.51.83-.1.83z"/>
      </svg>
    ),
  },
  {
    name: 'Telegram', href: 'https://t.me/Cybertgames',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.91c-.12.57-.47.7-.95.44l-2.62-1.93-1.27 1.22c-.14.14-.26.26-.53.26l.19-2.67 4.87-4.39c.21-.19-.05-.29-.33-.1L7.35 14.27l-2.56-.8c-.56-.17-.57-.56.12-.83l10-3.86c.46-.17.87.11.73.02z"/>
      </svg>
    ),
  },
  {
    name: 'Discord', href: 'https://discord.gg/6VSkWvRJ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.32 4.37A19.8 19.8 0 0 0 15.65 3c-.19.33-.4.78-.55 1.13a18.3 18.3 0 0 0-6.2 0C8.74 3.78 8.52 3.33 8.34 3A19.7 19.7 0 0 0 3.67 4.37C.53 9.1-.32 13.7.1 18.24a19.97 19.97 0 0 0 6.07 3.07c.49-.66.92-1.37 1.3-2.1a12.97 12.97 0 0 1-2.04-.99c.17-.12.34-.25.5-.38a14.3 14.3 0 0 0 12.14 0c.16.13.33.26.5.38-.65.38-1.33.71-2.05.99.37.73.81 1.44 1.3 2.1a19.9 19.9 0 0 0 6.08-3.07c.5-5.17-.85-9.72-3.58-13.87zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.43s.96-2.43 2.16-2.43c1.21 0 2.18 1.09 2.16 2.43 0 1.34-.95 2.43-2.16 2.43zm7.96 0c-1.18 0-2.16-1.09-2.16-2.43s.96-2.43 2.16-2.43c1.2 0 2.17 1.09 2.16 2.43 0 1.34-.94 2.43-2.16 2.43z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok', href: 'https://www.tiktok.com/@cybert.games',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
]
