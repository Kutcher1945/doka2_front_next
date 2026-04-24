import { auth } from '@/auth'
import axios from 'axios'
import { LobbyHistory } from '@/components/lobby/LobbyHistory'
import type { GameHistory } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getUserHistory(token: string): Promise<GameHistory[]> {
  try {
    const res = await axios.get(`${API_URL}/dota/game_history/`, {
      headers: { Authorization: `Token ${token}` },
    })
    return res.data
  } catch {
    return []
  }
}

export default async function LobbyHistoryPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!
  const history = await getUserHistory(token)

  return <LobbyHistory initialHistory={history} />
}
