import Image from 'next/image'
import { LandingClient } from '@/components/landing/LandingClient'
import { siteApi } from '@/lib/api'

async function getSiteStatus() {
  try {
    const res = await siteApi.status()
    return res.data.is_enabled as boolean
  } catch {
    return true
  }
}

export default async function LandingPage() {
  const isEnabled = await getSiteStatus()

  if (!isEnabled) {
    return (
      <main className="relative w-screen h-screen bg-black">
        <Image
          src="/images/redesign/landing/maintenece.png"
          alt="Технические работы"
          fill
          className="object-cover"
        />
      </main>
    )
  }

  return <LandingClient />
}
