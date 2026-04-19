import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { CabinetHeader } from '@/components/layout/CabinetHeader'
import { SessionRefresher } from '@/components/providers/SessionRefresher'
import { PageTransition } from '@/components/layout/PageTransition'
import axios from 'axios'
import type { User, UserWallet } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getServerData(token: string) {
  const headers = { Authorization: `Token ${token}` }
  try {
    const [userRes, walletRes] = await Promise.allSettled([
      axios.get(`${API_URL}/auth/data/`, { headers }),
      axios.get(`${API_URL}/monetix/wallet/`, { headers }),
    ])

    const user = userRes.status === 'fulfilled' ? userRes.value.data as User : null
    const wallet = walletRes.status === 'fulfilled' ? walletRes.value.data as UserWallet : null

    return { user, wallet }
  } catch {
    return { user: null, wallet: null }
  }
}

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/')

  const token = (session as { auth_token?: string }).auth_token
  if (!token) redirect('/')

  const { user: freshUser, wallet } = await getServerData(token)
  const user = freshUser ?? (session as { user?: User }).user ?? null
  if (!user) redirect('/')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080710' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        <CabinetHeader user={user} wallet={wallet} />
        <Suspense>
          <SessionRefresher />
        </Suspense>
        <main style={{ flex: 1, overflowY: 'auto', background: '#080710' }}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
