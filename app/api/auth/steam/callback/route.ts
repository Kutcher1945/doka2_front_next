import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const RANK_TO_MMR: Record<string, number> = {
  'Herald I': 0, 'Herald II': 140, 'Herald III': 280, 'Herald IV': 420, 'Herald V': 560, 'Herald VI': 700,
  'Guardian I': 840, 'Guardian II': 980, 'Guardian III': 1120, 'Guardian IV': 1260, 'Guardian V': 1400, 'Guardian VI': 1540,
  'Crusader I': 1680, 'Crusader II': 1820, 'Crusader III': 1960, 'Crusader IV': 2100, 'Crusader V': 2240, 'Crusader VI': 2380,
  'Archon I': 2520, 'Archon II': 2660, 'Archon III': 2800, 'Archon IV': 2940, 'Archon V': 3080, 'Archon VI': 3220,
  'Legend I': 3360, 'Legend II': 3500, 'Legend III': 3640, 'Legend IV': 3780, 'Legend V': 3920, 'Legend VI': 4060,
  'Ancient I': 4200, 'Ancient II': 4340, 'Ancient III': 4480, 'Ancient IV': 4620, 'Ancient V': 4760, 'Ancient VI': 4900,
  'Divine I': 5180, 'Divine II': 5320, 'Divine III': 5460, 'Divine IV': 5600, 'Divine V': 5740,
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const token = url.searchParams.get('token') ?? ''

  // Build verification params
  const verifyParams = new URLSearchParams()
  url.searchParams.forEach((v, k) => verifyParams.set(k, v))
  verifyParams.set('openid.mode', 'check_authentication')

  try {
    // Verify with Steam
    const verifyRes = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    })
    const verifyText = await verifyRes.text()

    if (!verifyText.includes('is_valid:true')) {
      return NextResponse.redirect(`${APP_URL}/cabinet?steam_error=invalid`)
    }

    // Extract Steam ID from claimed_id
    const claimedId = url.searchParams.get('openid.claimed_id') ?? ''
    const steamIdMatch = claimedId.match(/\/(\d+)$/)
    if (!steamIdMatch) {
      return NextResponse.redirect(`${APP_URL}/cabinet?steam_error=no_id`)
    }
    const steamId = steamIdMatch[1]

    // Fetch MMR from Dotabuff
    let mmr: number | null = null
    try {
      const dotabuffRes = await fetch(`https://www.dotabuff.com/players/${steamId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      const html = await dotabuffRes.text()
      const rankMatch = html.match(/rank-tier-wrapper[^>]*title="[^:]+:\s*([^"]+)"/)
      if (rankMatch) {
        const rankName = rankMatch[1].trim()
        mmr = RANK_TO_MMR[rankName] ?? null
      }
    } catch {
      // Dotabuff fetch failed, continue without MMR
    }

    // Update user in Django
    const updateData: { steam_id: string; connected_games: { id: string; name: string }[]; dota_mmr?: number } = {
      steam_id: steamId,
      connected_games: [{ id: '1', name: 'dota' }],
    }
    if (mmr !== null && mmr > 0) {
      updateData.dota_mmr = mmr
    }

    await axios.put(`${API_URL}/auth/data/`, updateData, {
      headers: { Authorization: `Token ${token}` },
    })

    const redirectUrl = mmr && mmr > 0
      ? `${APP_URL}/cabinet?refresh=1`
      : `${APP_URL}/cabinet?refresh=1&mmr_error=1`

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('Steam callback error:', err)
    return NextResponse.redirect(`${APP_URL}/cabinet?steam_error=server`)
  }
}
