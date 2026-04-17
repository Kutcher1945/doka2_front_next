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
      <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-[2.8rem] font-bold uppercase">Технические работы</h1>
        <p className="text-[1.6rem] text-[#878787] mt-2">Скоро всё заработает :)</p>
      </main>
    )
  }

  return <LandingClient />
}
