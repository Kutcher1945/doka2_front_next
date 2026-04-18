'use client'

import { useState } from 'react'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingProve } from './LandingProve'
import { LandingFeatures } from './LandingFeatures'
import { LandingSteps } from './LandingSteps'
import { LandingFooter } from './LandingFooter'
import { LandingContact } from './LandingContact'
import { LandingTestimonials } from './LandingTestimonials'
import { AuthModals, type ModalType } from './AuthModals'
import { MusicProvider } from './MusicContext'

export function LandingClient() {
  const [modal, setModal] = useState<ModalType>(null)

  return (
    <MusicProvider>
    <div className="landing-root" style={{ width: '100%', minHeight: '100vh', background: '#0d0d0f', color: '#fff' }}>
      <style>{`
        .landing-root, .landing-root * { cursor: url('/cursor.svg') 16 16, auto !important; }
        .landing-root button, .landing-root a { cursor: url('/cursor.svg') 16 16, pointer !important; }
      `}</style>
      <LandingHeader onSignIn={() => setModal('signin')} onSignUp={() => setModal('signup')} />
      <LandingHero />
      <LandingProve />
      <LandingFeatures onSignUp={() => setModal('signup')} />
      <LandingSteps />
      <LandingTestimonials />
      <LandingContact />
      <LandingFooter />
      <AuthModals modal={modal} setModal={setModal} />
    </div>
    </MusicProvider>
  )
}
