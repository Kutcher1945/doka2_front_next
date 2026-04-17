'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function SessionRefresher() {
  const { update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('refresh') === '1') {
      update().then(() => {
        // Hard navigation so server components re-render with the updated JWT
        const params = new URLSearchParams(searchParams.toString())
        params.delete('refresh')
        const query = params.toString()
        const cleanUrl = pathname + (query ? `?${query}` : '')
        window.location.replace(cleanUrl)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
