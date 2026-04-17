import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import axios from 'axios'
import type { User } from '@/types'
import SettingsForm from './SettingsForm'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function ProfileSettingsPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token ?? ''
  if (!token) redirect('/')

  let steamId: string | null = null
  try {
    const res = await axios.get(`${API_URL}/auth/data/`, {
      headers: { Authorization: `Token ${token}` },
    })
    steamId = (res.data as User).steam_id ?? null
  } catch {
    redirect('/')
  }

  return <SettingsForm steamId={steamId} />
}
