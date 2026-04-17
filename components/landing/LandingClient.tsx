'use client'

import { useState } from 'react'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingProve } from './LandingProve'
import { LandingFeatures } from './LandingFeatures'
import { LandingSteps } from './LandingSteps'
import { LandingFooter } from './LandingFooter'
import { AuthModals, type ModalType } from './AuthModals'

export function LandingClient() {
  const [modal, setModal] = useState<ModalType>(null)

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0d0d0f', color: '#fff' }}>
      <LandingHeader onSignIn={() => setModal('signin')} onSignUp={() => setModal('signup')} />
      <LandingHero />
      <LandingProve />
      <LandingFeatures onSignUp={() => setModal('signup')} />
      <LandingSteps />
      <LandingFooter />
      <AuthModals modal={modal} setModal={setModal} />
    </div>
  )
}
