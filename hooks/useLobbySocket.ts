'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { LobbySocketMessage } from '@/types'

const WS_BASE =
  typeof window !== 'undefined'
    ? (window.location.protocol === 'https:' ? 'wss' : 'ws') +
      '://' +
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/^https?:\/\//, '')
    : 'ws://localhost:8000'

export function useLobbySocket(
  lobbyId: string | number,
  onMessage: (data: LobbySocketMessage) => void
) {
  const ws = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    const url = `${WS_BASE}/ws/lobby/${lobbyId}/`
    ws.current = new WebSocket(url)

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LobbySocketMessage
        onMessageRef.current(data)
      } catch {
        console.error('Failed to parse socket message')
      }
    }

    ws.current.onclose = () => {
      console.error('Lobby WebSocket closed')
    }

    return () => {
      ws.current?.close()
    }
  }, [lobbyId])

  const send = useCallback((data: LobbySocketMessage['data']) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ data }))
    }
  }, [])

  const readyState = ws.current?.readyState ?? WebSocket.CLOSED

  return { send, readyState }
}
