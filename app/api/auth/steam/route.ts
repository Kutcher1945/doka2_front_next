import { NextRequest, NextResponse } from 'next/server'

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''

  const callbackUrl = `${APP_URL}/api/auth/steam/callback?token=${encodeURIComponent(token)}`

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': callbackUrl,
    'openid.realm': APP_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  return NextResponse.redirect(`${STEAM_OPENID_URL}?${params.toString()}`)
}
