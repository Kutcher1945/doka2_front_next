import { auth } from '@/auth'
import axios from 'axios'
import { FriendsList } from '@/components/friends/FriendsList'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FriendUser {
  id: number
  username: string
  status: string
}

export default async function FriendsPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!
  const headers = { Authorization: `Token ${token}` }

  const [listRes, pendingRes] = await Promise.allSettled([
    axios.get(`${API_URL}/community/friends/list/`, { headers }),
    axios.get(`${API_URL}/community/friends/received_requests/`, { headers }),
  ])

  const friends: FriendUser[] = listRes.status === 'fulfilled' ? listRes.value.data : []
  const pendingRequests: FriendUser[] = pendingRes.status === 'fulfilled' ? pendingRes.value.data : []

  return <FriendsList friends={friends} pendingRequests={pendingRequests} />
}
