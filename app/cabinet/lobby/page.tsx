import { auth } from '@/auth'
import axios from 'axios'
import { LobbyBrowser } from '@/components/lobby/LobbyBrowser'
import type { Lobby } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getInitialLobbies(token: string): Promise<Lobby[]> {
  try {
    const res = await axios.get(`${API_URL}/dota/lobby/`, {
      headers: { Authorization: `Token ${token}` },
      params: { amount: 10, offset: 0, lobby_bet_min: 0, lobby_bet_max: 999999 },
    })
    return res.data
  } catch {
    return []
  }
}

export default async function LobbyListPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!
  const lobbies = await getInitialLobbies(token)

  return <LobbyBrowser initialLobbies={lobbies} />
}
