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
import { LandingCarousel } from './LandingCarousel'
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

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatYSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, -4%) scale(1.05); }
          66% { transform: translate(-2%, 3%) scale(0.97); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .anim-float { animation: floatY 5s ease-in-out infinite; }
        .anim-float-slow { animation: floatYSlow 7s ease-in-out infinite; }
        .anim-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .anim-pulse-scale { animation: pulseScale 4s ease-in-out infinite; }
        .anim-orb { animation: orb-drift 12s ease-in-out infinite; }
      `}</style>
      <LandingHeader onSignIn={() => setModal('signin')} onSignUp={() => setModal('signup')} />
      <LandingHero />
      <LandingCarousel onSignUp={() => setModal('signup')} />
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
