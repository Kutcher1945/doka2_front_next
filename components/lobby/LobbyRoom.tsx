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

const card: React.CSSProperties = {
  background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '1.4rem',
  padding: '2.4rem',
}

const label: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.22)',
  fontFamily: "'Gotham Pro', sans-serif",
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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const { send } = useLobbySocket(lobby.id, useCallback(async (msg: LobbySocketMessage) => {
    if (msg.data.success) {
      await refreshLobby()
      if (msg.data.full) setShowReadyModal(true)
      if (msg.data.status) { setShowReadyModal(false); startPolling() }
    }
  }, [refreshLobby]))

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
    if (lobby.status === 'Pending' || lobby.status === 'Game started') startPolling()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
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

  const commission = 15
  const winAmount = ((lobby.bet ?? 0) * 2 * (1 - commission / 100)).toFixed(0)
  const { bg: statusBg, color: statusColor, text: statusText } = getStatus(lobby.status)

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
        <Link href="/cabinet/lobby" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Лобби
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.2rem' }}>/</span>
        <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.5)', fontFamily: "'Gotham Pro', sans-serif" }}>#{lobby.id}</span>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', borderRadius: '10rem', background: statusBg, border: `1px solid ${statusColor}40` }}>
          <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: statusColor }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: statusColor, fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{statusText}</span>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2.8fr) minmax(0,1fr) minmax(0,2fr)', gap: '1.4rem', alignItems: 'start' }}>

        {/* ── Col 1: Lobby + Chat ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Lobby card */}
          <div style={card}>
            {/* Title */}
            <div style={{ marginBottom: '2.4rem' }}>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.1 }}>{lobby.name}</h1>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.4rem' }}>{lobby.game_mode} · {members.length}/{lobby.slots} игроков</p>
            </div>

            {/* Teams */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.6rem' }}>
              {/* Radiant */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  <div style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ ...label, color: '#22c55e' }}>Radiant</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {team1.map(({ slot, member }) => (
                    <PlayerSlot key={slot} slot={slot} member={member} lobbyStatus={lobby.status} team="radiant"
                      onClick={lobby.status === 'Created' ? () => joinLobby('1', slot) : undefined} />
                  ))}
                </div>
              </div>

              {/* VS divider */}
              {/* Dire */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  <div style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ ...label, color: '#ef4444' }}>Dire</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {team2.map(({ slot, member }) => (
                    <PlayerSlot key={slot} slot={slot} member={member} lobbyStatus={lobby.status} team="dire"
                      onClick={lobby.status === 'Created' ? () => joinLobby('2', slot) : undefined} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          {lobby.status !== 'Finished' && (
            <div style={card}>
              <div style={{ ...label, marginBottom: '1.2rem' }}>Чат</div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.8rem', height: '14rem', padding: '1.2rem', overflowY: 'auto', fontSize: '1.2rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1rem' }}>
                Чат пока недоступен...
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <input
                  disabled
                  placeholder="Напишите сообщение..."
                  style={{ flex: 1, padding: '1rem 1.4rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", outline: 'none', opacity: 0.5 }}
                />
                <button disabled style={{ padding: '1rem 1.6rem', borderRadius: '0.8rem', background: 'rgba(141,94,244,0.3)', border: 'none', color: '#fff', cursor: 'not-allowed', opacity: 0.5 }}>→</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Col 2: Info ── */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ ...label, marginBottom: '2rem' }}>Информация</div>

          <InfoRow label="Ставка" value={`${lobby.bet ?? 0} очков`} />
          <InfoRow label="Победа" value={`${winAmount} очков`} accent />
          <InfoRow label="Режим" value={lobby.game_mode} />
          <InfoRow label="Мест" value={`${members.length}/${lobby.slots}`} />
          <InfoRow label="Комиссия" value={`${commission}%`} />

          {lobby.status === 'Created' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => router.push('/cabinet/lobby')}
                style={{ width: '100%', padding: '1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >
                Список лобби
              </button>
              {userInLobby && (
                <button
                  onClick={leaveLobby}
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.8rem', border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', color: 'rgba(239,68,68,0.8)', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                >
                  Покинуть лобби
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Col 3: Similar ── */}
        <div style={card}>
          <div style={{ ...label, marginBottom: '2rem' }}>Похожие лобби</div>
          {similarLobbies.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '10rem', gap: '0.8rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет похожих лобби</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {similarLobbies.slice(0, 8).map((l, i) => (
                <Link key={l.id} href={`/cabinet/lobby/${l.id}`} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.2rem 0', textDecoration: 'none',
                  borderBottom: i < Math.min(similarLobbies.length, 8) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'color 0.15s', color: 'rgba(255,255,255,0.6)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B999FD'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  <span style={{ fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>{l.name}</span>
                  <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", whiteSpace: 'nowrap' }}>{l.bet} pts</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Ready Modal ── */}
      {showReadyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(141,94,244,0.35)', borderRadius: '1.6rem', padding: '4rem', textAlign: 'center', maxWidth: '44rem', width: '100%' }}>
            <div style={{ fontSize: '3.2rem', marginBottom: '0.8rem' }}>⚔️</div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: '0 0 0.8rem' }}>Лобби заполнено!</h2>
            <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '3rem' }}>Все игроки на местах. Подтвердите готовность.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.4rem' }}>
              {members.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.4rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>Игрок #{m.user_id}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: m.status ? '#22c55e' : 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {m.status ? '✓ Готов' : 'Ожидание...'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={markReady}
              style={{ width: '100%', padding: '1.4rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)', border: 'none', color: '#fff', fontSize: '1.6rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", cursor: 'pointer', letterSpacing: '0.06em' }}
            >
              Готов!
            </button>
          </div>
        </div>
      )}

      {/* ── Results Modal ── */}
      {showResultsModal && gameHistory && (() => {
        const radiantWon = gameHistory.result === 'DOTA_GC_TEAM_GOOD_GUYS'
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: `1px solid ${radiantWon ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '1.6rem', padding: '4rem', textAlign: 'center', maxWidth: '56rem', width: '100%' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{radiantWon ? '🏆' : '💀'}</div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 700, color: radiantWon ? '#22c55e' : '#ef4444', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: '0 0 0.4rem' }}>
                {radiantWon ? 'Radiant победил!' : 'Dire победил!'}
              </h2>
              <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '2.4rem' }}>Матч #{lobby.match_id}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2.4rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', overflow: 'hidden' }}>
                {gameHistory.players_info.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.6rem', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{p.game_name}</span>
                    <span style={{ color: p.game_team === 'DOTA_GC_TEAM_GOOD_GUYS' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {p.game_team === 'DOTA_GC_TEAM_GOOD_GUYS' ? 'Radiant' : 'Dire'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby') }}
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '0.9rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', fontFamily: "'Gotham Pro', sans-serif", cursor: 'pointer' }}
                >
                  Список лобби
                </button>
                <button
                  onClick={() => { setShowResultsModal(false); router.push('/cabinet/lobby/create') }}
                  style={{ flex: 1, padding: '1.2rem', borderRadius: '0.9rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)', border: 'none', color: '#fff', fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif", cursor: 'pointer' }}
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

  if (member) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.9rem 1.4rem', borderRadius: '0.9rem',
        background: member.status ? `${teamColor}08` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${member.status ? `${teamColor}30` : 'rgba(255,255,255,0.06)'}`,
      }}>
        <div style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', background: `linear-gradient(135deg, #8D5EF4, #B999FD)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: "'Gotham Pro', sans-serif" }}>
          {String(member.user_id).charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Игрок #{member.user_id}
        </span>
        {member.status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '1.1rem', color: '#22c55e', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600 }}>Готов</span>
          </div>
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
        width: '100%', display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.9rem 1.4rem', borderRadius: '0.9rem', cursor: canJoin ? 'pointer' : 'default',
        background: 'transparent',
        border: canJoin ? `1px dashed ${teamColor}40` : '1px dashed rgba(255,255,255,0.07)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (canJoin) { e.currentTarget.style.background = `${teamColor}08`; e.currentTarget.style.borderColor = `${teamColor}70` } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = canJoin ? `${teamColor}40` : 'rgba(255,255,255,0.07)' }}
    >
      <div style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0, fontFamily: "'Gotham Pro', sans-serif" }}>
        {slot}
      </div>
      <span style={{ fontSize: '1.3rem', color: canJoin ? `${teamColor}80` : 'rgba(255,255,255,0.15)', fontFamily: "'Gotham Pro', sans-serif" }}>
        {lobbyStatus === 'Created' ? 'Свободно' : '—'}
      </span>
      {canJoin && (
        <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`${teamColor}60`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      )}
    </button>
  )
}

function InfoRow({ label: l, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>{l}</span>
      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: accent ? '#B999FD' : 'rgba(255,255,255,0.75)', fontFamily: "'Gotham Pro', sans-serif" }}>{value}</span>
    </div>
  )
}

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
