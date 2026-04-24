'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLobbySocket } from '@/hooks/useLobbySocket'
import { lobbyApi } from '@/lib/api'
import { useStore } from '@/store'
import type { Lobby, Membership, GameHistory, LobbySocketMessage, User } from '@/types'

interface LobbyRoomProps {
  initialLobby: Lobby
  initialMembers: Membership[]
  similarLobbies: Lobby[]
}

export function LobbyRoom({ initialLobby, initialMembers, similarLobbies }: LobbyRoomProps) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const user = session?.user as unknown as User
  const setCurrentLobby = useStore((s) => s.setCurrentLobby)

  const [lobby, setLobby] = useState<Lobby>(initialLobby)
  const [members, setMembers] = useState<Membership[]>(initialMembers)
  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null)
  const [lobbyFull, setLobbyFull] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [dotaLaunching, setDotaLaunching] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userInLobby = members.some((m) => Number(m.user_id) === Number(user?.id))

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

  const authToken = sessionStatus === 'loading'
    ? undefined
    : ((session as { auth_token?: string })?.auth_token ?? null)

  const ERROR_LABELS: Record<string, string> = {
    in_lobby: 'Вы уже в другом лобби',
    lobby_full: 'Лобби заполнено',
    balance: 'Недостаточно очков',
    user_is_blocked: 'Аккаунт заблокирован',
    out_mmr_range: 'MMR не совпадает с соперником',
    lobby_not_found: 'Лобби не найдено',
    'Bots are busy': 'Все боты заняты, попробуйте позже',
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      try {
        const res = await lobbyApi.get(lobby.id)
        const updated = res.data as Lobby
        setLobby(updated)
        if (updated.status === 'Finished') {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          await fetchGameHistory()
          await refreshLobby()
          setShowResultsModal(true)
          setCurrentLobby(null)
        } else if (updated.status === 'Created' || updated.status === 'Error') {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          setCurrentLobby(null)
        }
      } catch { /* ignore */ }
    }, 2000)
  }, [lobby.id, fetchGameHistory, refreshLobby, setCurrentLobby])

  const startCountdown = useCallback(() => {
    setCountdown(10)
    countdownRef.current = setInterval(async () => {
      // Poll lobby every tick so dota_lobby_id appears on overlay ASAP
      try {
        const res = await lobbyApi.get(lobby.id)
        setLobby(res.data)
      } catch { /* ignore */ }

      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          setCountdown(null)
          startPolling()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [startPolling, lobby.id])

  const { send } = useLobbySocket(lobby.id, useCallback(async (msg: LobbySocketMessage) => {
    if (msg.data.success) {
      await refreshLobby()
      if (msg.data.full) setLobbyFull(true)
      if (msg.data.status) startCountdown()
    } else if (msg.data.error) {
      showToast(ERROR_LABELS[msg.data.error] ?? msg.data.error)
    }
  }, [refreshLobby, showToast, startCountdown]), authToken)

  useEffect(() => {
    if (lobby.status === 'Pending' || lobby.status === 'Game started') startPolling()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  function joinLobby(team: '1' | '2', position: number) {
    if (!user?.id) return
    if (!userInLobby) send({ command: 'new_membership', userID: user.id, lobbyID: lobby.id, team, userPosition: position })
  }
  function leaveLobby() {
    if (!user?.id) return
    send({ command: 'remove_membership', userID: user.id, lobbyID: lobby.id })
    setCurrentLobby(null)
  }
  function markReady() {
    if (!user?.id) return
    send({ command: 'status_ready', userID: user.id, lobbyID: lobby.id })
  }

  const team1 = Array.from({ length: lobby.slots / 2 }, (_, i) => ({
    slot: i + 1, member: members.find((m) => m.team === '1' && m.position === i + 1),
  }))
  const team2 = Array.from({ length: lobby.slots / 2 }, (_, i) => ({
    slot: i + 1, member: members.find((m) => m.team === '2' && m.position === i + 1),
  }))

  const currentMember = members.find((m) => Number(m.user_id) === Number(user?.id))
  const iAmReady = currentMember?.status ?? false
  const allReady = members.length > 0 && members.every((m) => m.status)

  const commission = 15
  const winAmount = ((lobby.bet ?? 0) * 2 * (1 - commission / 100)).toFixed(0)
  const { bg: statusBg, color: statusColor, text: statusText } = getStatus(lobby.status)

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <Link href="/cabinet/lobby" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Лобби
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Gotham Pro', sans-serif" }}>#{lobby.id}</span>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: '10rem', background: statusBg, border: `1px solid ${statusColor}35` }}>
          <div style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: statusColor, fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{statusText}</span>
        </div>
      </div>

      {/* Waiting for bot banner — shown while bot is setting up the Dota 2 lobby */}
      {lobby.status === 'Pending' && !lobby.dota_lobby_id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.2rem 1.8rem', borderRadius: '1.1rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ width: '1.6rem', height: '1.6rem', borderRadius: '50%', border: '2px solid rgba(245,158,11,0.6)', borderTopColor: '#f59e0b', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b', fontFamily: "'Gotham Pro', sans-serif" }}>Бот создаёт лобби в Dota 2...</div>
            <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.2rem' }}>Это займёт около минуты. Кнопка «Открыть в Dota 2» появится автоматически.</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2.6fr) minmax(0,1fr) minmax(0,1.8fr)', gap: '1.4rem', alignItems: 'start' }}>

        {/* ── Col 1: Lobby + Chat ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Lobby hero card */}
          <div style={{ borderRadius: '1.6rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>

            {/* Top hero banner */}
            <div style={{
              position: 'relative', padding: '2.8rem 2.8rem 2.4rem',
              background: 'linear-gradient(135deg, #12101c 0%, #0e0c1a 100%)',
              overflow: 'hidden',
            }}>
              {/* Ambient glows */}
              <div style={{ position: 'absolute', top: '-4rem', left: '-2rem', width: '22rem', height: '22rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '-4rem', right: '-2rem', width: '22rem', height: '22rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(239,68,68,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.6rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.1 }}>{lobby.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.2)', fontSize: '1.1rem', fontWeight: 600, color: 'rgba(185,153,253,0.8)', fontFamily: "'Gotham Pro', sans-serif" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      {lobby.game_mode}
                    </span>
                    {lobby.vs_bots && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', fontSize: '1.1rem', fontWeight: 700, color: '#22c55e', fontFamily: "'Gotham Pro', sans-serif" }}>
                        🤖 Vs Bots
                      </span>
                    )}
                    <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                      {members.length}/{lobby.vs_bots ? lobby.slots / 2 : lobby.slots} игроков
                    </span>
                  </div>
                </div>
                {/* Bet badge */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.3rem' }}>Ставка</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{lobby.bet ?? 0}</div>
                  <div style={{ fontSize: '1.1rem', color: 'rgba(185,153,253,0.6)', fontFamily: "'Gotham Pro', sans-serif" }}>очков</div>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const cap = lobby.vs_bots ? lobby.slots / 2 : lobby.slots
                return (
                  <div style={{ marginTop: '2rem', height: '0.3rem', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(members.length / cap) * 100}%`, borderRadius: '99px', background: 'linear-gradient(90deg, #22c55e, #B999FD)', transition: 'width 0.4s ease' }} />
                  </div>
                )
              })()}
            </div>

            {/* Teams section */}
            <div style={{ background: 'linear-gradient(180deg, #0e0c1a 0%, #0b0a15 100%)', padding: '2rem 2.8rem 2.8rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.6rem', alignItems: 'start' }}>

                {/* Radiant */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.4rem', padding: '0.6rem 1rem', borderRadius: '0.8rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', width: 'fit-content' }}>
                    <div style={{ width: '0.7rem', height: '0.7rem', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', fontFamily: "'Gotham Pro', sans-serif" }}>Radiant</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {team1.map(({ slot, member }) => (
                      <PlayerSlot key={slot} slot={slot} member={member} lobbyStatus={lobby.status} team="radiant"
                        onClick={lobby.status === 'Created' ? () => joinLobby('1', slot) : undefined} />
                    ))}
                  </div>
                </div>

                {/* VS divider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '0.5rem', gap: '0.4rem' }}>
                  <div style={{ width: '1px', height: '3rem', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08))' }} />
                  <div style={{ padding: '0.5rem 0.9rem', borderRadius: '0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'rgba(255,255,255,0.25)', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.05em' }}>VS</span>
                  </div>
                  <div style={{ width: '1px', height: '3rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }} />
                </div>

                {/* Dire */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.4rem', padding: '0.6rem 1rem', borderRadius: '0.8rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', width: 'fit-content' }}>
                    <div style={{ width: '0.7rem', height: '0.7rem', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ef4444', fontFamily: "'Gotham Pro', sans-serif" }}>Dire</span>
                  </div>
                  {lobby.vs_bots ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {team2.map(({ slot }) => (
                        <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.1rem 1.4rem', borderRadius: '1.1rem', background: 'rgba(239,68,68,0.04)', border: '1px dashed rgba(239,68,68,0.15)' }}>
                          <div style={{ width: '3.2rem', height: '3.2rem', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.4rem' }}>🤖</div>
                          <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'rgba(239,68,68,0.6)', fontFamily: "'Gotham Pro', sans-serif" }}>AI Bot</div>
                            <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.15rem' }}>Средний уровень</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {team2.map(({ slot, member }) => (
                        <PlayerSlot key={slot} slot={slot} member={member} lobbyStatus={lobby.status} team="dire"
                          onClick={lobby.status === 'Created' ? () => joinLobby('2', slot) : undefined} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          {lobby.status !== 'Finished' && (
            <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>
              <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Чат</span>
                <span style={{ marginLeft: 'auto', fontSize: '1rem', color: 'rgba(255,255,255,0.12)', fontFamily: "'Gotham Pro', sans-serif" }}>Скоро</span>
              </div>
              <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.1)', fontFamily: "'Gotham Pro', sans-serif" }}>Чат пока недоступен...</span>
              </div>
              <div style={{ padding: '1.2rem 1.6rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.8rem' }}>
                <input disabled placeholder="Напишите сообщение..." style={{ flex: 1, padding: '0.9rem 1.4rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", outline: 'none', opacity: 0.35 }} />
                <button disabled style={{ padding: '0.9rem 1.4rem', borderRadius: '0.8rem', background: 'rgba(141,94,244,0.15)', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Col 2: Info + Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Stats */}
          <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Информация</span>
            </div>
            <div style={{ padding: '0.4rem 0' }}>
              <StatRow icon={<CoinIcon />} label="Ставка" value={`${lobby.bet ?? 0}`} unit="очков" />
              <StatRow icon={<TrophyIcon />} label="Победа" value={winAmount} unit="очков" accent />
              <StatRow icon={<GameIcon />} label="Режим" value={lobby.game_mode} />
              <StatRow icon={<SlotIcon />} label="Мест" value={`${members.length}/${lobby.vs_bots ? lobby.slots / 2 : lobby.slots}`} />
              <StatRow icon={<PctIcon />} label="Комиссия" value={`${commission}%`} last />
            </div>
          </div>

          {/* Action buttons */}
          {(lobby.status === 'Created' || lobby.status === 'Pending' || lobby.status === 'Game started' || lobby.status === 'Error') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>

              {/* Ready button — shown when lobby is full and user hasn't confirmed yet */}
              {userInLobby && lobbyFull && lobby.status === 'Created' && (
                <button
                  onClick={markReady}
                  disabled={iAmReady}
                  style={{
                    width: '100%', padding: '1.2rem 1.4rem', borderRadius: '1rem',
                    background: iAmReady
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.08) 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: iAmReady ? '1px solid rgba(34,197,94,0.35)' : 'none',
                    color: iAmReady ? '#22c55e' : '#fff',
                    fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif",
                    cursor: iAmReady ? 'default' : 'pointer',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                    boxShadow: iAmReady ? 'none' : '0 4px 20px rgba(34,197,94,0.35)',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => { if (!iAmReady) e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {iAmReady ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Вы готовы</>
                  ) : '⚔️ Готов!'}
                </button>
              )}

              {/* Open in Dota 2 / join info */}
              {lobby.dota_lobby_id && lobby.bot_steam_id && (lobby.status === 'Pending' || lobby.status === 'Game started') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {!dotaLaunching ? (
                  <>
                  <button
                    onClick={() => {
                      window.open('steam://rungameid/570', '_blank')
                      setDotaLaunching(true)
                    }}
                    style={{ width: '100%', padding: '1.1rem 1.4rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(141,94,244,0.2) 0%, rgba(185,153,253,0.12) 100%)', border: '1px solid rgba(141,94,244,0.4)', color: '#B999FD', fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', boxSizing: 'border-box' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(141,94,244,0.35) 0%, rgba(185,153,253,0.2) 100%)'; e.currentTarget.style.borderColor = 'rgba(141,94,244,0.7)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(141,94,244,0.2) 0%, rgba(185,153,253,0.12) 100%)'; e.currentTarget.style.borderColor = 'rgba(141,94,244,0.4)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Открыть в Dota 2
                  </button>
                  <div style={{ padding: '1rem 1.2rem', borderRadius: '0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Войти вручную в Dota 2</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>Название</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>CyberT | {lobby.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>Пароль</span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#B999FD', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.1em' }}>{lobby.id}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.7rem', fontSize: '1rem', color: 'rgba(255,255,255,0.15)', fontFamily: "'Gotham Pro', sans-serif", lineHeight: 1.5 }}>
                      Игра → Пользовательские лобби → найти по названию
                    </div>
                  </div>
                  </>
                  ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.9rem 1.2rem', borderRadius: '0.9rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '1.15rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                      <div style={{ width: '0.9rem', height: '0.9rem', borderRadius: '50%', border: '2px solid rgba(245,158,11,0.4)', borderTopColor: '#f59e0b', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                      Ждите главного меню Dota 2
                    </div>
                    <button
                      onClick={() => { window.location.href = `steam://joinlobby/570/${lobby.dota_lobby_id}/${lobby.bot_steam_id}` }}
                      style={{ width: '100%', padding: '1.1rem 1.4rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', color: '#fff', fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', boxShadow: '0 4px 16px rgba(34,197,94,0.35)', boxSizing: 'border-box' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Войти в лобби
                    </button>
                  </>
                  )}
                </div>
              )}

              <button
                onClick={() => router.push('/cabinet/lobby')}
                style={{ width: '100%', padding: '1rem 1.4rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.45)', fontSize: '1.25rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Список лобби
              </button>
              {userInLobby && lobby.status !== 'Finished' && (
                <button
                  onClick={leaveLobby}
                  style={{ width: '100%', padding: '1rem 1.4rem', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', color: 'rgba(239,68,68,0.7)', fontSize: '1.25rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Покинуть лобби
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Col 3: Similar lobbies ── */}
        <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="2" y="15" width="6" height="6" rx="1"/><rect x="10" y="9" width="6" height="6" rx="1"/><rect x="18" y="3" width="4" height="4" rx="1"/><rect x="18" y="15" width="4" height="6" rx="1"/></svg>
            <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Похожие лобби</span>
          </div>

          {similarLobbies.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '1rem' }}>
              <div style={{ width: '4.4rem', height: '4.4rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет похожих лобби</span>
            </div>
          ) : (
            <div style={{ padding: '0.6rem 0' }}>
              {similarLobbies.slice(0, 8).map((l, i) => (
                <Link key={l.id} href={`/cabinet/lobby/${l.id}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1rem 1.8rem', textDecoration: 'none',
                  borderBottom: i < Math.min(similarLobbies.length, 8) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(141,94,244,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', overflow: 'hidden' }}>
                    <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: 'rgba(141,94,244,0.5)', flexShrink: 0 }} />
                    <span style={{ fontSize: '1.25rem', fontFamily: "'Gotham Pro', sans-serif", color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>{l.name}</span>
                  </div>
                  <span style={{ fontSize: '1.15rem', color: 'rgba(185,153,253,0.5)', fontFamily: "'Gotham Pro', sans-serif", whiteSpace: 'nowrap', marginLeft: '0.8rem', fontWeight: 700 }}>{l.bet} pts</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Error toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2.4rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 2rem', borderRadius: '1.1rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '1.35rem', fontWeight: 600, color: '#fca5a5', fontFamily: "'Gotham Pro', sans-serif" }}>{toast}</span>
        </div>
      )}

      {/* ── Countdown overlay — fires when all players are ready ── */}
      {countdown !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '2rem' }}>
              Все готовы! Игра начинается через
            </div>
            {/* Big countdown ring */}
            <div style={{ position: 'relative', width: '16rem', height: '16rem', margin: '0 auto 2.4rem' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="none" stroke="#22c55e" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - countdown / 10)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear', filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{countdown}</span>
              </div>
            </div>
            {/* Player ready list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '36rem', margin: '0 auto 2rem' }}>
              {members.map((m) => (
                <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.4rem', borderRadius: '0.9rem', background: m.status ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${m.status ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)'}` }}>
                  <span style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.65)', fontFamily: "'Gotham Pro', sans-serif" }}>Игрок #{m.user_id}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: m.status ? '#22c55e' : 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {m.status
                      ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Готов</>
                      : 'Ожидание...'}
                  </span>
                </div>
              ))}
            </div>

            {/* Join Dota 2 button on the overlay itself */}
            {lobby.dota_lobby_id && lobby.bot_steam_id ? (
              <div style={{ maxWidth: '36rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {!dotaLaunching ? (
                  <button
                    onClick={() => {
                      window.open('steam://rungameid/570', '_blank')
                      setDotaLaunching(true)
                    }}
                    style={{ width: '100%', padding: '1.4rem', borderRadius: '1.1rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)', border: 'none', color: '#fff', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", cursor: 'pointer', letterSpacing: '0.06em', boxShadow: '0 4px 24px rgba(141,94,244,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Открыть Dota 2
                  </button>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.4rem', borderRadius: '0.9rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '1.2rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(245,158,11,0.4)', borderTopColor: '#f59e0b', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                      Дождитесь главного меню Dota 2
                    </div>
                    <button
                      onClick={() => { window.location.href = `steam://joinlobby/570/${lobby.dota_lobby_id}/${lobby.bot_steam_id}` }}
                      style={{ width: '100%', padding: '1.4rem', borderRadius: '1.1rem', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', color: '#fff', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", cursor: 'pointer', letterSpacing: '0.06em', boxShadow: '0 4px 24px rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Войти в лобби
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: '36rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                <div style={{ width: '1.2rem', height: '1.2rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                Бот создаёт лобби...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Results Modal ── */}
      {showResultsModal && gameHistory && (() => {
        const radiantWon = gameHistory.result === 'DOTA_GC_TEAM_GOOD_GUYS'
        const accent = radiantWon ? '#22c55e' : '#ef4444'
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'linear-gradient(160deg, #13111f 0%, #0e0c1a 100%)', border: `1px solid ${accent}25`, borderRadius: '2rem', padding: '4rem', textAlign: 'center', maxWidth: '58rem', width: '100%', boxShadow: `0 0 80px ${accent}08, 0 32px 64px rgba(0,0,0,0.5)` }}>
              <div style={{ width: '7rem', height: '7rem', borderRadius: '50%', background: `radial-gradient(ellipse, ${accent}18 0%, transparent 70%)`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '3.2rem' }}>
                {radiantWon ? '🏆' : '💀'}
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: 700, color: accent, fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: '0 0 0.4rem' }}>
                {radiantWon ? 'Radiant победил!' : 'Dire победил!'}
              </h2>
              <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '2.8rem' }}>Матч #{lobby.match_id}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.8rem', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {gameHistory.players_info.map((p, i) => {
                  const isRadiant = p.game_team === 'DOTA_GC_TEAM_GOOD_GUYS'
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.8rem', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                      <span style={{ color: 'rgba(255,255,255,0.65)' }}>{p.game_name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.8rem', borderRadius: '0.5rem', background: isRadiant ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isRadiant ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '1.1rem' }}>
                        <div style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: 'currentColor' }} />
                        {isRadiant ? 'Radiant' : 'Dire'}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby') }}
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.45)', fontSize: '1.4rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
                >
                  Список лобби
                </button>
                <button
                  onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby/create') }}
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)', border: 'none', color: '#fff', fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", cursor: 'pointer', boxShadow: '0 4px 20px rgba(141,94,244,0.3)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  Новое лобби
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function PlayerSlot({ slot, member, lobbyStatus, team, onClick }: {
  slot: number; member: Membership | undefined; lobbyStatus: string
  team: 'radiant' | 'dire'; onClick?: () => void
}) {
  const teamColor = team === 'radiant' ? '#22c55e' : '#ef4444'
  const teamColorRgb = team === 'radiant' ? '34,197,94' : '239,68,68'

  if (member) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.2rem',
        padding: '1.1rem 1.4rem', borderRadius: '1.1rem',
        background: member.status
          ? `linear-gradient(135deg, rgba(${teamColorRgb},0.1) 0%, rgba(${teamColorRgb},0.04) 100%)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(${teamColorRgb},${member.status ? '0.25' : '0.12'})`,
        transition: 'all 0.2s',
      }}>
        <div style={{
          width: '3.2rem', height: '3.2rem', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, rgba(${teamColorRgb},0.4), rgba(${teamColorRgb},0.15))`,
          border: `1.5px solid rgba(${teamColorRgb},0.35)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif",
          boxShadow: `0 0 12px rgba(${teamColorRgb},0.2)`,
        }}>
          {String(member.user_id).charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Игрок #{member.user_id}
          </div>
          <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.15rem' }}>
            Слот {slot}
          </div>
        </div>
        {member.status ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '0.6rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', flexShrink: 0 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: '1.05rem', color: '#22c55e', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 700 }}>Готов</span>
          </div>
        ) : (
          <div style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: teamColor, opacity: 0.6, flexShrink: 0, boxShadow: `0 0 6px ${teamColor}` }} />
        )}
      </div>
    )
  }

  const canJoin = !!onClick && lobbyStatus === 'Created'
  return (
    <button
      onClick={onClick}
      disabled={!canJoin}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '1.2rem',
        padding: '1.1rem 1.4rem', borderRadius: '1.1rem',
        cursor: canJoin ? 'pointer' : 'default',
        background: 'transparent',
        border: canJoin ? `1px dashed rgba(${teamColorRgb},0.3)` : '1px dashed rgba(255,255,255,0.06)',
        transition: 'all 0.18s',
      }}
      onMouseEnter={e => { if (canJoin) { e.currentTarget.style.background = `rgba(${teamColorRgb},0.06)`; e.currentTarget.style.borderColor = `rgba(${teamColorRgb},0.55)` } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = canJoin ? `rgba(${teamColorRgb},0.3)` : 'rgba(255,255,255,0.06)' }}
    >
      <div style={{
        width: '3.2rem', height: '3.2rem', borderRadius: '50%', flexShrink: 0,
        background: canJoin ? `rgba(${teamColorRgb},0.07)` : 'rgba(255,255,255,0.03)',
        border: canJoin ? `1.5px dashed rgba(${teamColorRgb},0.35)` : '1.5px dashed rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', color: canJoin ? `rgba(${teamColorRgb},0.7)` : 'rgba(255,255,255,0.15)',
      }}>
        {canJoin ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        ) : (
          <span style={{ fontFamily: "'Gotham Pro', sans-serif", fontWeight: 700 }}>{slot}</span>
        )}
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: '1.25rem', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600, color: canJoin ? `rgba(${teamColorRgb},0.75)` : 'rgba(255,255,255,0.15)' }}>
          {lobbyStatus === 'Created' ? 'Свободно' : '—'}
        </div>
        {canJoin && (
          <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.15rem' }}>
            Нажмите чтобы войти
          </div>
        )}
      </div>
    </button>
  )
}

function StatRow({ icon, label, value, unit, accent, last }: {
  icon: React.ReactNode; label: string; value: string; unit?: string; accent?: boolean; last?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.8rem', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ width: '2.8rem', height: '2.8rem', borderRadius: '0.7rem', background: 'rgba(141,94,244,0.08)', border: '1px solid rgba(141,94,244,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: accent ? '#B999FD' : 'rgba(255,255,255,0.8)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.1rem' }}>
          {value}{unit && <span style={{ fontSize: '1.05rem', fontWeight: 400, color: 'rgba(255,255,255,0.25)', marginLeft: '0.4rem' }}>{unit}</span>}
        </div>
      </div>
    </div>
  )
}

function CoinIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }
function TrophyIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 0 0-2 2v1a5 5 0 0 0 5 5"/><path d="M17 4h3a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5"/><rect x="7" y="2" width="10" height="9" rx="2"/></svg> }
function GameIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M17 12h.01"/></svg> }
function SlotIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function PctIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> }

function getStatus(s: string): { bg: string; color: string; text: string } {
  switch (s) {
    case 'Created':      return { bg: 'rgba(141,94,244,0.1)', color: '#8D5EF4', text: 'Набор' }
    case 'Pending':      return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', text: 'Ожидание' }
    case 'Game started': return { bg: 'rgba(34,197,94,0.1)',  color: '#22c55e', text: 'Игра идёт' }
    case 'Finished':     return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', text: 'Завершена' }
    case 'Error':        return { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', text: 'Ошибка' }
    default:             return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', text: s }
  }
}
