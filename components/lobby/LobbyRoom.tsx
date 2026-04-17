'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLobbySocket } from '@/hooks/useLobbySocket'
import { lobbyApi } from '@/lib/api'
import { useStore } from '@/store'
import { cn, formatTime } from '@/lib/utils'
import type { Lobby, Membership, GameHistory, LobbySocketMessage, User } from '@/types'

interface LobbyRoomProps {
  initialLobby: Lobby
  initialMembers: Membership[]
  similarLobbies: Lobby[]
}

export function LobbyRoom({ initialLobby, initialMembers, similarLobbies }: LobbyRoomProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as unknown as User
  const setCurrentLobby = useStore((s) => s.setCurrentLobby)

  const [lobby, setLobby] = useState<Lobby>(initialLobby)
  const [members, setMembers] = useState<Membership[]>(initialMembers)
  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null)
  const [showReadyModal, setShowReadyModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [timerMs, setTimerMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userInLobby = members.some((m) => m.user_id === user?.id)

  // ---- Refresh helpers ----
  const refreshLobby = useCallback(async () => {
    const [lobbyRes, membersRes] = await Promise.all([
      lobbyApi.get(lobby.id),
      lobbyApi.memberships(lobby.id),
    ])
    setLobby(lobbyRes.data)
    setMembers(membersRes.data)
    return lobbyRes.data as Lobby
  }, [lobby.id])

  const fetchGameHistory = useCallback(async () => {
    try {
      const res = await lobbyApi.gameHistory(lobby.id)
      setGameHistory(res.data.game_history)
    } catch { /* no history yet */ }
  }, [lobby.id])

  // ---- WebSocket ----
  const { send } = useLobbySocket(lobby.id, useCallback(async (msg: LobbySocketMessage) => {
    if (msg.data.success) {
      const updated = await refreshLobby()
      if (msg.data.full) setShowReadyModal(true)
      if (msg.data.status) {
        setShowReadyModal(false)
        startPolling()
      }
    }
  }, [refreshLobby]))

  // ---- Polling for game finish ----
  function startPolling() {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await lobbyApi.get(lobby.id)
        const updated = res.data as Lobby
        setLobby(updated)
        if (updated.status === 'Finished') {
          clearInterval(pollingRef.current!)
          await fetchGameHistory()
          await refreshLobby()
          setShowResultsModal(true)
          setCurrentLobby(null)
        }
      } catch { /* ignore */ }
    }, 5000)
  }

  useEffect(() => {
    if (lobby.status === 'Pending' || lobby.status === 'Game started') {
      startPolling()
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  useEffect(() => {
    if (lobby.status === 'Pending' && !showReadyModal) {
      setShowReadyModal(false)
    }
  }, [lobby.status])

  // ---- Socket actions ----
  function joinLobby(team: '1' | '2', position: number) {
    if (!userInLobby) {
      send({ command: 'new_membership', userID: user.id, lobbyID: lobby.id, team, userPosition: position })
    }
  }

  function leaveLobby() {
    send({ command: 'remove_membership', userID: user.id, lobbyID: lobby.id })
    setCurrentLobby(null)
  }

  function markReady() {
    send({ command: 'status_ready', userID: user.id, lobbyID: lobby.id })
  }

  // ---- Slots layout ----
  const team1 = Array.from({ length: lobby.slots / 2 }, (_, i) => {
    const member = members.find((m) => m.team === '1' && m.position === i + 1)
    return { slot: i + 1, member }
  })
  const team2 = Array.from({ length: lobby.slots / 2 }, (_, i) => {
    const member = members.find((m) => m.team === '2' && m.position === i + 1)
    return { slot: i + 1, member }
  })

  const commission = 15 // TODO: fetch
  const winAmount = ((lobby.bet ?? 0) * 2 * (1 - commission / 100)).toFixed(0)

  return (
    <div className="max-w-[160rem] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.85fr)_minmax(0,1fr)_minmax(0,2fr)] gap-4">

        {/* --- Column 1: Lobby card + chat --- */}
        <div className="flex flex-col gap-4">
          {/* Lobby card */}
          <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-[2rem] font-semibold">{lobby.name}</h1>
                <p className="text-[1.3rem] text-[#878787] mt-1">#{lobby.id} · {lobby.game_mode}</p>
              </div>
              <span className={cn('px-3 py-1 rounded-full text-[1.2rem]', statusColor(lobby.status))}>
                {statusLabel(lobby.status)}
              </span>
            </div>

            {/* Teams grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Team 1 (Radiant) */}
              <div>
                <div className="text-[1.2rem] text-green-400 font-medium mb-2">Radiant</div>
                <div className="space-y-2">
                  {team1.map(({ slot, member }) => (
                    <PlayerSlot
                      key={slot}
                      slot={slot}
                      member={member}
                      lobbyStatus={lobby.status}
                      onClick={lobby.status === 'Created' ? () => joinLobby('1', slot) : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Team 2 (Dire) */}
              <div>
                <div className="text-[1.2rem] text-red-400 font-medium mb-2">Dire</div>
                <div className="space-y-2">
                  {team2.map(({ slot, member }) => (
                    <PlayerSlot
                      key={slot}
                      slot={slot}
                      member={member}
                      lobbyStatus={lobby.status}
                      onClick={lobby.status === 'Created' ? () => joinLobby('2', slot) : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat (placeholder) */}
          {lobby.status !== 'Finished' && (
            <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-4">
              <div className="bg-[#282829] rounded-[0.5rem] h-48 p-3 overflow-y-auto text-[1.2rem] text-[#606060] mb-3">
                Чат пока недоступен...
              </div>
              <div className="flex gap-2">
                <input
                  disabled
                  placeholder="Напишите сообщение..."
                  className="flex-1 px-3 py-2 rounded-[0.5rem] bg-[#282829] border border-[#323232] text-[1.3rem] text-white placeholder:text-[#606060] focus:outline-none opacity-50"
                />
                <button disabled className="px-4 py-2 rounded-[0.5rem] bg-[#754FE0] opacity-50">→</button>
              </div>
            </div>
          )}
        </div>

        {/* --- Column 2: Settings --- */}
        <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-6 space-y-4">
          <h2 className="text-[1.6rem] font-semibold">Информация</h2>

          <InfoRow label="Ставка" value={`${lobby.bet ?? 0} ₸`} />
          <InfoRow label="Победа" value={`${winAmount} ₸`} />
          <InfoRow label="Режим" value={lobby.game_mode} />
          <InfoRow label="Мест" value={`${members.length}/${lobby.slots}`} />
          <InfoRow label="Комиссия" value={`${commission}%`} />

          {lobby.status === 'Created' && (
            <>
              <button
                onClick={() => router.push('/cabinet/lobby')}
                className="w-full py-2 rounded-[0.5rem] border border-[#323232] text-[#878787] text-[1.3rem] hover:border-white hover:text-white transition-colors"
              >
                Список лобби
              </button>
              {userInLobby && (
                <button
                  onClick={leaveLobby}
                  className="w-full py-2 rounded-[0.5rem] border border-red-500/30 text-red-400 text-[1.3rem] hover:bg-red-500/10 transition-colors"
                >
                  Покинуть лобби
                </button>
              )}
            </>
          )}
        </div>

        {/* --- Column 3: Similar lobbies --- */}
        <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-6">
          <h2 className="text-[1.6rem] font-semibold mb-4">Похожие лобби</h2>
          {similarLobbies.length === 0 ? (
            <p className="text-[1.3rem] text-[#878787]">Нет похожих лобби</p>
          ) : (
            <div className="space-y-2">
              {similarLobbies.slice(0, 8).map((l) => (
                <Link
                  key={l.id}
                  href={`/cabinet/lobby/${l.id}`}
                  className="flex justify-between items-center py-2 border-b border-[#323232] last:border-0 hover:text-[#754FE0] transition-colors text-[1.3rem]"
                >
                  <span className="truncate mr-2">{l.name}</span>
                  <span className="text-[#878787] whitespace-nowrap">{l.bet} ₸</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ready Modal */}
      {showReadyModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1b] border border-[#754FE0] rounded-[1.1rem] p-8 text-center max-w-[40rem] w-full">
            <h2 className="text-[2.4rem] font-bold mb-4">Лобби готово!</h2>
            <p className="text-[1.4rem] text-[#878787] mb-8">
              Все игроки заняли места. Подтвердите готовность.
            </p>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex justify-between items-center text-[1.3rem]">
                  <span>Игрок #{m.user_id}</span>
                  <span className={m.status ? 'text-green-400' : 'text-[#878787]'}>
                    {m.status ? '✓ Готов' : 'Ожидание...'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={markReady}
              className="mt-8 w-full py-3 rounded-[0.5rem] bg-[#754FE0] text-white text-[1.6rem] font-semibold hover:bg-[#6340cc] transition-colors"
            >
              Готов!
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && gameHistory && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1b] border border-[#323232] rounded-[1.1rem] p-8 text-center max-w-[60rem] w-full">
            <h2 className="text-[2.8rem] font-bold mb-2">
              {gameHistory.result === 'DOTA_GC_TEAM_GOOD_GUYS' ? '🏆 Radiant победил!' : '💀 Dire победил!'}
            </h2>
            <p className="text-[1.4rem] text-[#878787] mb-6">Матч #{lobby.match_id}</p>
            <div className="space-y-2 mb-8">
              {gameHistory.players_info.map((p) => (
                <div key={p.id} className="flex justify-between text-[1.3rem] py-2 border-b border-[#323232] last:border-0">
                  <span>{p.game_name}</span>
                  <span className="text-[#878787]">{p.game_team === 'DOTA_GC_TEAM_GOOD_GUYS' ? 'Radiant' : 'Dire'}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby') }}
                className="flex-1 py-3 rounded-[0.5rem] border border-[#323232] text-[#878787] hover:text-white transition-colors"
              >
                Список лобби
              </button>
              <button
                onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby/create') }}
                className="flex-1 py-3 rounded-[0.5rem] bg-[#754FE0] text-white hover:bg-[#6340cc] transition-colors"
              >
                Новое лобби
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerSlot({
  slot, member, lobbyStatus, onClick,
}: {
  slot: number
  member: Membership | undefined
  lobbyStatus: string
  onClick?: () => void
}) {
  if (member) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-[0.5rem] bg-[#282829] border',
        member.status ? 'border-green-500/50' : 'border-[#323232]'
      )}>
        <div className="w-6 h-6 rounded-full bg-[#754FE0] flex items-center justify-center text-[1rem] font-bold">
          {slot}
        </div>
        <span className="text-[1.3rem] text-[#878787] truncate">Игрок #{member.user_id}</span>
        {member.status && <span className="ml-auto text-green-400 text-[1rem]">✓</span>}
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick || lobbyStatus !== 'Created'}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-[0.5rem] border border-dashed text-[1.3rem] transition-colors',
        onClick && lobbyStatus === 'Created'
          ? 'border-[#754FE0]/50 text-[#754FE0] hover:bg-[#754FE0]/10'
          : 'border-[#323232] text-[#606060] cursor-default'
      )}
    >
      <div className="w-6 h-6 rounded-full bg-[#282829] border border-[#323232] flex items-center justify-center text-[1rem]">
        {slot}
      </div>
      {lobbyStatus === 'Created' ? 'Свободно' : '—'}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[1.3rem]">
      <span className="text-[#878787]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function statusColor(s: string) {
  switch (s) {
    case 'Created': return 'bg-blue-500/20 text-blue-400'
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400'
    case 'Game started': return 'bg-green-500/20 text-green-400'
    case 'Finished': return 'bg-[#282829] text-[#878787]'
    case 'Error': return 'bg-red-500/20 text-red-400'
    default: return 'bg-[#282829] text-[#878787]'
  }
}

function statusLabel(s: string) {
  switch (s) {
    case 'Created': return 'Набор'
    case 'Pending': return 'Ожидание'
    case 'Game started': return 'Игра идёт'
    case 'Finished': return 'Завершена'
    case 'Error': return 'Ошибка'
    default: return s
  }
}
