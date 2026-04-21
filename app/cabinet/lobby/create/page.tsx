'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { lobbyApi } from '@/lib/api'
import type { User } from '@/types'

type GameMode = 'All Pick' | '1v1 Solo Mid' | 'Captains Mode'

const MODES: { id: GameMode; label: string; desc: string; slots: 2 | 10; icon: string }[] = [
  { id: '1v1 Solo Mid', label: '1v1 Solo Mid', desc: '2 игрока · Мидлейн', slots: 2, icon: '⚔️' },
  { id: 'All Pick',     label: 'All Pick',     desc: '10 игроков · Стандарт', slots: 10, icon: '🛡️' },
  { id: 'Captains Mode', label: 'Captains Mode', desc: '10 игроков · Драфт', slots: 10, icon: '👑' },
]

const BET_PRESETS = [100, 250, 500, 1000, 2500]

export default function CreateLobbyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as unknown as User

  const [name, setName] = useState('')
  const [bet, setBet] = useState('')
  const [gameMode, setGameMode] = useState<GameMode>('1v1 Solo Mid')
  const [slots, setSlots] = useState<2 | 10>(2)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [vsBots, setVsBots] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function selectMode(m: typeof MODES[0]) {
    setGameMode(m.id)
    setSlots(m.slots)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Введите название лобби'); return }
    if (Number(bet) < 50) { setError('Минимальная ставка — 50'); return }
    setLoading(true)
    try {
      const res = await lobbyApi.create({
        name: name.trim(),
        bet: Number(bet),
        slots,
        game_mode: gameMode,
        leader: user.id,
        password: isPrivate && password ? password : undefined,
        vs_bots: vsBots,
      })
      router.push(`/cabinet/lobby/${res.data.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Ошибка при создании лобби')
    } finally {
      setLoading(false)
    }
  }

  const selectedMode = MODES.find(m => m.id === gameMode)!

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
          Создать лобби
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
          Настройте условия и пригласите соперника
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', maxWidth: '72rem' }}>

        {error && (
          <div style={{ padding: '1.4rem 1.8rem', borderRadius: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '1.4rem', fontFamily: "'Gotham Pro', sans-serif", display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Name ── */}
        <Card>
          <SectionLabel icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          }>Название лобби</SectionLabel>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Быстрый 1v1, Ладдер 5000+"
            maxLength={50}
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>{name.length}/50</span>
          </div>
        </Card>

        {/* ── Game mode ── */}
        <Card>
          <SectionLabel icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          }>Режим игры</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.4rem' }}>
            {MODES.map(m => {
              const active = gameMode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMode(m)}
                  style={{
                    padding: '1.4rem 1.2rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
                    background: active ? 'linear-gradient(135deg, rgba(141,94,244,0.2) 0%, rgba(107,63,212,0.12) 100%)' : 'rgba(255,255,255,0.03)',
                    outline: active ? '1.5px solid rgba(141,94,244,0.55)' : '1.5px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start', gap: '0.5rem',
                    textAlign: 'left' as const,
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: active ? '#C9AAFF' : 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: '1.1rem', color: active ? 'rgba(185,153,253,0.55)' : 'rgba(255,255,255,0.22)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {m.desc}
                  </span>
                  {active && (
                    <span style={{ marginTop: '0.2rem', fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0.8rem', borderRadius: '0.4rem', background: 'rgba(141,94,244,0.2)', color: '#B999FD', fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.05em' }}>
                      ВЫБРАНО
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* ── Bet ── */}
        <Card>
          <SectionLabel icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          }>Ставка</SectionLabel>

          {/* Preset chips */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' as const, marginBottom: '1.2rem', marginTop: '0.4rem' }}>
            {BET_PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setBet(String(p))}
                style={{
                  padding: '0.5rem 1.4rem', borderRadius: '0.6rem', cursor: 'pointer', border: 'none',
                  background: bet === String(p) ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  outline: bet === String(p) ? '1.5px solid rgba(34,197,94,0.4)' : '1.5px solid rgba(255,255,255,0.07)',
                  color: bet === String(p) ? '#22c55e' : 'rgba(255,255,255,0.5)',
                  fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Gotham Pro', sans-serif",
                  transition: 'all 0.12s',
                }}
              >
                {p.toLocaleString('ru-RU')}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={bet}
              onChange={e => setBet(e.target.value)}
              placeholder="Введите сумму вручную"
              min={50}
              style={{ ...inputStyle, paddingRight: '5rem' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <span style={{ position: 'absolute', right: '1.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.3rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 700, pointerEvents: 'none' }}>очков</span>
          </div>
          <p style={{ marginTop: '0.7rem', fontSize: '1.15rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>
            Минимальная ставка — 50 очков
          </p>
        </Card>

        {/* ── Privacy toggle ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '3.6rem', height: '3.6rem', borderRadius: '0.8rem', background: isPrivate ? 'rgba(141,94,244,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isPrivate ? '#B999FD' : 'rgba(255,255,255,0.3)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: isPrivate ? '#C9AAFF' : 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif", transition: 'color 0.2s' }}>
                  Приватное лобби
                </div>
                <div style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  Доступ только по паролю
                </div>
              </div>
            </div>
            {/* Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivate(v => !v)}
              style={{
                width: '4.8rem', height: '2.6rem', borderRadius: '1.3rem', border: 'none', cursor: 'pointer',
                background: isPrivate ? 'linear-gradient(90deg, #7C3AED, #8D5EF4)' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: '3px', width: '2rem', height: '2rem', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                left: isPrivate ? 'calc(100% - 2.3rem)' : '3px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }} />
            </button>
          </div>

          {isPrivate && (
            <div style={{ marginTop: '1.4rem', paddingTop: '1.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Придумайте пароль"
                  style={{ ...inputStyle, paddingRight: '4.8rem' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '0.4rem' }}
                >
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Vs Bots toggle ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '3.6rem', height: '3.6rem', borderRadius: '0.8rem', background: vsBots ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vsBots ? '#22c55e' : 'rgba(255,255,255,0.3)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: vsBots ? '#22c55e' : 'rgba(255,255,255,0.7)', fontFamily: "'Gotham Pro', sans-serif", transition: 'color 0.2s' }}>
                  Против ботов
                </div>
                <div style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  Играть одному против ИИ Dota 2 (для тестов)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVsBots(v => !v)}
              style={{
                width: '4.8rem', height: '2.6rem', borderRadius: '1.3rem', border: 'none', cursor: 'pointer',
                background: vsBots ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: '3px', width: '2rem', height: '2rem', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                left: vsBots ? 'calc(100% - 2.3rem)' : '3px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }} />
            </button>
          </div>
          {vsBots && (
            <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem', color: 'rgba(34,197,94,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Dire будет заполнен ИИ-ботами среднего уровня. Только вы заходите в слот Radiant.
            </div>
          )}
        </Card>

        {/* ── Summary & submit ── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(141,94,244,0.08) 0%, rgba(107,63,212,0.04) 100%)',
          border: '1px solid rgba(141,94,244,0.2)',
          borderRadius: '1.4rem', padding: '2rem 2.4rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' as const,
        }}>
          <div style={{ display: 'flex', gap: '3rem' }}>
            <SummaryItem label="Режим" value={`${selectedMode.icon} ${selectedMode.label}`} />
            <SummaryItem label="Игроков" value={String(slots)} />
            <SummaryItem label="Ставка" value={bet ? `${Number(bet).toLocaleString('ru-RU')} очков` : '—'} highlight={!!bet} />
            <SummaryItem label="Доступ" value={isPrivate ? '🔒 Закрытое' : '🌐 Открытое'} />
            {vsBots && <SummaryItem label="Режим" value="🤖 Vs Bots" highlight />}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '1.2rem 2.4rem', borderRadius: '1rem', cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', fontWeight: 600,
                fontFamily: "'Gotham Pro', sans-serif", transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1.2rem 3.2rem', borderRadius: '1rem', cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                background: loading ? 'rgba(141,94,244,0.4)' : 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
                color: '#fff', fontSize: '1.4rem', fontWeight: 700,
                fontFamily: "'Gotham Pro', sans-serif",
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '0.8rem',
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                  Создание...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Создать лобби
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1.4rem', padding: '2rem 2.2rem',
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.4rem' }}>
      <div style={{ color: 'rgba(185,153,253,0.6)' }}>{icon}</div>
      <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
        {children}
      </span>
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.3rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: highlight ? '#22c55e' : 'rgba(255,255,255,0.8)', fontFamily: "'Gotham Pro', sans-serif" }}>{value}</div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '1.2rem 1.6rem', borderRadius: '0.9rem',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '1.4rem', fontFamily: "'Gotham Pro', sans-serif",
  outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
}
