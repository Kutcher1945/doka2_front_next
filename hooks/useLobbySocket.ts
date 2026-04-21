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
  onMessage: (data: LobbySocketMessage) => void,
  authToken?: string | null
) {
  const ws = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const retryDelay = useRef(1000)
  const destroyed = useRef(false)

  useEffect(() => {
    // Wait until session is resolved; undefined means still loading
    if (authToken === undefined) return

    destroyed.current = false

    function connect() {
      if (destroyed.current) return
      const url = authToken
        ? `${WS_BASE}/ws/lobby/${lobbyId}/?token=${authToken}`
        : `${WS_BASE}/ws/lobby/${lobbyId}/`
      const socket = new WebSocket(url)
      ws.current = socket

      socket.onopen = () => {
        retryDelay.current = 1000
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as LobbySocketMessage
          onMessageRef.current(data)
        } catch {
          console.error('Failed to parse socket message')
        }
      }

      socket.onclose = () => {
        if (destroyed.current) return
        console.error('Lobby WebSocket closed, reconnecting in', retryDelay.current, 'ms')
        setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30000)
          connect()
        }, retryDelay.current)
      }
    }

    connect()

    return () => {
      destroyed.current = true
      ws.current?.close()
    }
  }, [lobbyId, authToken])

  const send = useCallback((data: LobbySocketMessage['data']) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ data }))
    }
  }, [])

  const readyState = ws.current?.readyState ?? WebSocket.CLOSED

  return { send, readyState }
}
