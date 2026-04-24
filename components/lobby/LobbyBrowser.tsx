'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { lobbyApi } from '@/lib/api'
import { commissionMultiplier } from '@/lib/utils'
import type { Lobby } from '@/types'

type GameMode = '1-v-1' | 'all-pick'

const COLS = [
  { key: 'name',    label: 'Название',    flex: '2 1 0' },
  { key: 'id',      label: 'ID',          flex: '0 0 7rem' },
  { key: 'bet',     label: 'Ставка',      flex: '1 1 0' },
  { key: 'slots',   label: 'Места',       flex: '0 0 8rem' },
  { key: 'prize',   label: 'В случае победы', flex: '1 1 0' },
  { key: 'status',  label: 'Статус',      flex: '0 0 12rem' },
]

function lobbyStatusBadge(s: string) {
  switch (s) {
    case 'Created':      return { label: 'Набор',      color: '#8D5EF4', bg: 'rgba(141,94,244,0.12)', dot: '#8D5EF4' }
    case 'Pending':      return { label: 'Ожидание',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' }
    case 'Game started': return { label: 'Игра идёт',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' }
    case 'Error':        return { label: 'Ошибка',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' }
    default:             return { label: s,             color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.06)', dot: 'rgba(255,255,255,0.3)' }
  }
}

interface LobbyBrowserProps {
  initialLobbies: Lobby[]
}

export function LobbyBrowser({ initialLobbies }: LobbyBrowserProps) {
  const router = useRouter()
  const [lobbies, setLobbies] = useState<Lobby[]>(initialLobbies)
  const [mode, setMode] = useState<GameMode>('1-v-1')
  const [search, setSearch] = useState('')
  const [betMin, setBetMin] = useState('')
  const [betMax, setBetMax] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const AMOUNT = 10
  const commissionPercent = 1.7

  const filtered = lobbies.filter((l) =>
    mode === '1-v-1' ? l.slots <= 2 : l.slots > 2
  )

  async function fetchLobbies(p: number, extra?: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await lobbyApi.list({
        amount: AMOUNT,
        offset: (p - 1) * AMOUNT,
        lobby_bet_min: betMin ? Number(betMin) : 0,
        lobby_bet_max: betMax ? Number(betMax) : 999999,
        lobby_name: search || undefined,
        ...extra,
      })
      setLobbies(res.data)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      <style>{`
        .lb-row { transition: background 0.15s, border-color 0.15s; }
        .lb-row:hover { background: rgba(141,94,244,0.12) !important; border-color: rgba(141,94,244,0.35) !important; }
        .lb-row:hover .lb-cell { color: #fff !important; }
        .lb-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; padding: 0.9rem 1.4rem; font-size: 1.3rem; color: #fff; font-family: 'Gotham Pro', sans-serif; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
        .lb-input::placeholder { color: rgba(255,255,255,0.2); }
        .lb-input:focus { border-color: rgba(141,94,244,0.5); }
        .lb-input[type=number]::-webkit-outer-spin-button,
        .lb-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .lb-input[type=number] { -moz-appearance: textfield; }
        .lb-pg-btn { background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; width: 3.2rem; height: 3.2rem; font-size: 1.3rem; font-family: 'Gotham Pro', sans-serif; color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.2s; }
        .lb-pg-btn:hover:not(:disabled) { border-color: rgba(141,94,244,0.5); color: #C9AAFF; }
        .lb-pg-btn.active { background: linear-gradient(135deg, #8D5EF4, #6B3FD4); border-color: transparent; color: #fff; }
        .lb-pg-btn:disabled { opacity: 0.25; cursor: default; }
      `}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
            Поиск лобби
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
            Найдите игру и присоединяйтесь
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Link
            href="/cabinet/lobby/history"
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.1rem 1.8rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: '1.3rem', fontFamily: "'Gotham Pro', sans-serif", textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            История
          </Link>
          <Link
            href="/cabinet/lobby/create"
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.1rem 2.4rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #8D5EF4 0%, #6B3FD4 100%)', color: '#fff', fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Gotham Pro', sans-serif", textDecoration: 'none', boxShadow: '0 4px 20px rgba(141,94,244,0.35)', transition: 'all 0.2s' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Создать лобби
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div style={{
        background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '1.6rem',
        overflow: 'hidden',
      }}>

        {/* Mode tabs + filters */}
        <div style={{ padding: '2rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Mode pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <ModeTab active={mode === '1-v-1'} onClick={() => setMode('1-v-1')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              1v1 Solo Mid
            </ModeTab>
            <ModeTab active={mode === 'all-pick'} onClick={() => setMode('all-pick')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              All Pick
            </ModeTab>
            <ModeTab active={false} onClick={() => {}} disabled>
              Captains Mode
              <span style={{ fontSize: '0.9rem', padding: '0.1rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', marginLeft: '0.4rem' }}>
                Скоро
              </span>
            </ModeTab>
          </div>

          {/* Search + bet filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1.3rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="lb-input"
                style={{ paddingLeft: '3.6rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLobbies(1)}
                placeholder="Поиск по названию..."
              />
            </div>

            {/* Bet min */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.3rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", pointerEvents: 'none' }}>От</span>
              <input
                className="lb-input"
                style={{ paddingLeft: '3.2rem' }}
                type="number"
                value={betMin}
                onChange={(e) => setBetMin(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Bet max */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.3rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", pointerEvents: 'none' }}>До</span>
              <input
                className="lb-input"
                style={{ paddingLeft: '3.2rem' }}
                type="number"
                value={betMax}
                onChange={(e) => setBetMax(e.target.value)}
                placeholder="∞"
              />
            </div>

            {/* Apply */}
            <button
              onClick={() => fetchLobbies(1)}
              style={{
                padding: '0.9rem 2rem', borderRadius: '0.8rem',
                background: 'rgba(141,94,244,0.15)',
                border: '1px solid rgba(141,94,244,0.35)',
                color: '#C9AAFF', fontSize: '1.3rem', fontWeight: 600,
                fontFamily: "'Gotham Pro', sans-serif",
                cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(141,94,244,0.25)'; e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(141,94,244,0.15)'; e.currentTarget.style.borderColor = 'rgba(141,94,244,0.35)' }}
            >
              Применить
            </button>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'flex', padding: '0.8rem 2.4rem',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {COLS.map((col) => (
            <div key={col.key} style={{ flex: col.flex, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", paddingRight: '1rem' }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Table body */}
        <div style={{ minHeight: '28rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '28rem', gap: '1.4rem' }}>
              <div style={{ width: '3.2rem', height: '3.2rem', borderRadius: '50%', border: '3px solid rgba(141,94,244,0.2)', borderTopColor: '#8D5EF4', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>Загрузка...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '28rem', gap: '1.4rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(141,94,244,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="14.5 2 18.5 9 22 9 22 11 2 11 2 9 5.5 9 9.5 2 14.5 2"/>
                <line x1="12" y1="11" x2="12" y2="22"/>
                <line x1="7" y1="22" x2="17" y2="22"/>
              </svg>
              <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>
                Нет лобби в режиме {mode === '1-v-1' ? '1v1 Solo Mid' : 'All Pick'}
              </span>
              <Link
                href="/cabinet/lobby/create"
                style={{ fontSize: '1.3rem', color: '#C9AAFF', fontFamily: "'Gotham Pro', sans-serif", textDecoration: 'none', fontWeight: 600 }}
              >
                Создать первое лобби →
              </Link>
            </div>
          ) : (
            filtered.map((lobby, i) => (
              <div
                key={lobby.id}
                className="lb-row"
                onClick={() => router.push(`/cabinet/lobby/${lobby.id}`)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '1.2rem 2.4rem',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  borderBottomColor: i < filtered.length - 1 ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                <div className="lb-cell" style={{ flex: '2 1 0', fontSize: '1.4rem', fontWeight: 600, color: '#fff', fontFamily: "'Gotham Pro', sans-serif", paddingRight: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                  {lobby.name}
                </div>
                <div className="lb-cell" style={{ flex: '0 0 7rem', fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  #{lobby.id}
                </div>
                <div className="lb-cell" style={{ flex: '1 1 0', fontSize: '1.4rem', fontWeight: 600, color: '#C9AAFF', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {lobby.bet ?? 0} ₸
                </div>
                <div className="lb-cell" style={{ flex: '0 0 8rem', fontFamily: "'Gotham Pro', sans-serif" }}>
                  <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.8rem', borderRadius: '0.5rem' }}>
                    0/{lobby.slots}
                  </span>
                </div>
                <div className="lb-cell" style={{ flex: '1 1 0', fontSize: '1.4rem', fontWeight: 700, color: '#22c55e', fontFamily: "'Gotham Pro', sans-serif" }}>
                  +{((lobby.bet ?? 0) * commissionPercent).toFixed(0)} ₸
                </div>
                <div className="lb-cell" style={{ flex: '0 0 12rem' }}>
                  {(() => { const b = lobbyStatusBadge(lobby.status); return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.9rem', borderRadius: '2rem', background: b.bg, fontSize: '1.1rem', fontWeight: 700, color: b.color, fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>
                      <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: b.dot, boxShadow: `0 0 5px ${b.dot}`, flexShrink: 0, display: 'inline-block' }} />
                      {b.label}
                    </span>
                  )})()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '1.8rem 2.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              className="lb-pg-btn"
              onClick={() => fetchLobbies(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              ‹
            </button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                className={`lb-pg-btn${page === p ? ' active' : ''}`}
                onClick={() => fetchLobbies(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="lb-pg-btn"
              onClick={() => fetchLobbies(page + 1)}
              disabled={filtered.length < AMOUNT}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ModeTab({ active, onClick, children, disabled }: {
  active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.8rem 1.6rem', borderRadius: '0.8rem',
        fontSize: '1.3rem', fontWeight: 600,
        fontFamily: "'Gotham Pro', sans-serif",
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s',
        border: active ? '1px solid rgba(141,94,244,0.5)' : '1px solid rgba(255,255,255,0.08)',
        background: active ? 'linear-gradient(135deg, rgba(141,94,244,0.25) 0%, rgba(141,94,244,0.12) 100%)' : 'transparent',
        color: active ? '#C9AAFF' : disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}
