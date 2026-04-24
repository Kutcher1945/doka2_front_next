'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { GameHistory, PlayerInfo, User } from '@/types'

interface Props {
  initialHistory: GameHistory[]
}

export function LobbyHistory({ initialHistory }: Props) {
  const { data: session } = useSession()
  const user = session?.user as unknown as User
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/cabinet/lobby" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Лобби
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Gotham Pro', sans-serif" }}>История</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.1rem', borderRadius: '10rem', background: 'rgba(141,94,244,0.1)', border: '1px solid rgba(141,94,244,0.2)' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#B999FD', fontFamily: "'Gotham Pro', sans-serif" }}>{initialHistory.length} игр</span>
        </div>
      </div>

      {/* Stats row */}
      {initialHistory.length > 0 && (() => {
        const wins = initialHistory.filter(h => {
          const myInfo = h.players_info.find(p => p.user_id === user?.id)
          return myInfo && h.result === myInfo.game_team
        }).length
        const losses = initialHistory.length - wins
        const totalBet = initialHistory.reduce((s, h) => s + (h.lobby?.bet ?? 0), 0)
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Победы', value: wins, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
              { label: 'Поражения', value: losses, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
              { label: 'Ставок сыграно', value: `${totalBet} pts`, color: '#B999FD', bg: 'rgba(141,94,244,0.08)', border: 'rgba(141,94,244,0.15)' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{ padding: '1.4rem 1.8rem', borderRadius: '1.2rem', background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color, fontFamily: "'Colus', 'Gotham Pro', sans-serif" }}>{value}</div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* List */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr auto', gap: '1rem', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['Лобби', 'Ставка', 'Режим', 'Результат', 'Дата', ''].map((h) => (
            <div key={h} style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>{h}</div>
          ))}
        </div>

        {initialHistory.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1rem' }}>
            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎮</div>
            <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Вы ещё не сыграли ни одной игры</div>
            <Link href="/cabinet/lobby" style={{ marginTop: '0.4rem', padding: '0.9rem 2rem', borderRadius: '0.9rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)', color: '#fff', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Colus', 'Gotham Pro', sans-serif" }}>
              Найти лобби
            </Link>
          </div>
        ) : (
          initialHistory.map((h, i) => {
            const myInfo = h.players_info.find(p => p.user_id === user?.id)
            const isWin = myInfo ? h.result === myInfo.game_team : null
            const isOpen = expanded === h.id
            const date = h.finish_game ? new Date(h.finish_game) : null

            return (
              <div key={h.id}>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr auto', gap: '1rem', padding: '1.2rem 2rem', borderBottom: i < initialHistory.length - 1 || isOpen ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.15s', background: isOpen ? 'rgba(141,94,244,0.04)' : 'transparent' }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                  onClick={() => setExpanded(isOpen ? null : h.id)}
                >
                  {/* Lobby name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', overflow: 'hidden' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: isWin === true ? '#22c55e' : isWin === false ? '#ef4444' : 'rgba(255,255,255,0.2)', flexShrink: 0, boxShadow: isWin === true ? '0 0 6px rgba(34,197,94,0.6)' : isWin === false ? '0 0 6px rgba(239,68,68,0.5)' : 'none' }} />
                    <span style={{ fontSize: '1.25rem', fontFamily: "'Gotham Pro', sans-serif", color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {h.lobby?.name ?? `Лобби #${h.lobby_link}`}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", flexShrink: 0 }}>#{h.lobby?.id ?? h.lobby_link}</span>
                  </div>

                  {/* Bet */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'rgba(185,153,253,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>{h.lobby?.bet ?? '—'} pts</span>
                  </div>

                  {/* Game mode (from players_info if available) */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'Gotham Pro', sans-serif" }}>
                      {h.players_info.length <= 2 ? '1v1' : '5v5'}
                    </span>
                  </div>

                  {/* Result */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isWin === null ? (
                      <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>—</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.8rem', borderRadius: '0.5rem', background: isWin ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: '1.1rem', fontWeight: 700, color: isWin ? '#22c55e' : '#ef4444', fontFamily: "'Gotham Pro', sans-serif" }}>
                        {isWin ? '▲ Победа' : '▼ Поражение'}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                      {date ? `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : '—'}
                    </span>
                  </div>

                  {/* Expand toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded player list */}
                {isOpen && (
                  <div style={{ padding: '1.2rem 2rem 1.6rem', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.4rem' }}>Игроки</div>
                    {h.players_info.length === 0 ? (
                      <div style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет данных об игроках</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: '0.6rem' }}>
                        {h.players_info.map((p) => {
                          const isRadiant = p.game_team === 'DOTA_GC_TEAM_GOOD_GUYS'
                          const isMe = p.user_id === user?.id
                          const teamColor = isRadiant ? '#22c55e' : '#ef4444'
                          const teamColorRgb = isRadiant ? '34,197,94' : '239,68,68'
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', borderRadius: '0.9rem', background: `rgba(${teamColorRgb},0.05)`, border: `1px solid rgba(${teamColorRgb},0.12)` }}>
                              <div style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', background: `rgba(${teamColorRgb},0.15)`, border: `1.5px solid rgba(${teamColorRgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif", flexShrink: 0 }}>
                                {(p.game_name || 'P').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: isMe ? '#B999FD' : 'rgba(255,255,255,0.75)', fontFamily: "'Gotham Pro', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.game_name || `Игрок #${p.user_id}`}
                                  </span>
                                  {isMe && <span style={{ fontSize: '0.9rem', color: '#B999FD', fontFamily: "'Gotham Pro', sans-serif", background: 'rgba(141,94,244,0.15)', padding: '0.1rem 0.5rem', borderRadius: '0.4rem', flexShrink: 0 }}>Вы</span>}
                                </div>
                                <div style={{ fontSize: '1rem', color: teamColor, fontFamily: "'Gotham Pro', sans-serif", marginTop: '0.1rem', opacity: 0.8 }}>{isRadiant ? 'Radiant' : 'Dire'}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
