import { auth } from '@/auth'
import axios from 'axios'
import { LobbyRoom } from '@/components/lobby/LobbyRoom'
import type { Lobby, Membership } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Props {
  params: Promise<{ id: string }>
}

async function getLobbyData(token: string, id: string) {
  const headers = { Authorization: `Token ${token}` }
  const [lobbyRes, membersRes, similarRes] = await Promise.allSettled([
    axios.get(`${API_URL}/dota/lobby/${id}/`, { headers }),
    axios.get(`${API_URL}/dota/lobby/${id}/memberships/`, { headers }),
    axios.get(`${API_URL}/dota/lobby/similar/`, { headers, params: { id } }),
  ])

  return {
    lobby: lobbyRes.status === 'fulfilled' ? (lobbyRes.value.data as Lobby) : null,
    members: membersRes.status === 'fulfilled' ? (membersRes.value.data as Membership[]) : [],
    similar: similarRes.status === 'fulfilled' ? (similarRes.value.data as Lobby[]) : [],
  }
}

export default async function LobbyPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!

  const { lobby, members, similar } = await getLobbyData(token, id)
  if (!lobby) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[1.6rem] text-[#878787]">Лобби не найдено</p>
      </div>
    )
  }

  return <LobbyRoom initialLobby={lobby} initialMembers={members} similarLobbies={similar} />
}
