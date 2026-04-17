import { auth } from '@/auth'
import axios from 'axios'
import type { GameHistory, User } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function HistoryPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!

  let history: GameHistory[] = []
  try {
    const res = await axios.get(`${API_URL}/dota/game_history/`, {
      headers: { Authorization: `Token ${token}` },
    })
    history = res.data
  } catch { /* empty */ }

  const wins = history.filter((g) => g.result === 'DOTA_GC_TEAM_GOOD_GUYS').length
  const losses = history.filter((g) => g.result === 'DOTA_GC_TEAM_BAD_GUYS').length

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
          История игр
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
          Все ваши сыгранные матчи
        </p>
      </div>

      {/* Stats row */}
      {history.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.4rem' }}>
          <MiniStat label="Всего игр" value={String(history.length)} color="#8D5EF4" />
          <MiniStat label="Победы" value={String(wins)} color="#22c55e" />
          <MiniStat label="Поражения" value={String(losses)} color="#ef4444" />
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '0.8rem 2.4rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {['Дата', 'Лобби', 'Результат', 'Игроки'].map((c) => (
            <div key={c} style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>
              {c}
            </div>
          ))}
        </div>

        {history.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '22rem', gap: '1.4rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет сыгранных игр</span>
          </div>
        ) : (
          history.map((game, i) => {
            const isWin = game.result === 'DOTA_GC_TEAM_GOOD_GUYS'
            const isLoss = game.result === 'DOTA_GC_TEAM_BAD_GUYS'
            return (
              <div key={game.id} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                padding: '1.2rem 2.4rem', alignItems: 'center',
                background: isWin ? 'rgba(34,197,94,0.03)' : isLoss ? 'rgba(239,68,68,0.03)' : 'transparent',
                borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {new Date(game.start_game).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  #{game.lobby_link}
                </div>
                <div>
                  <span style={{
                    fontSize: '1.25rem', fontWeight: 700,
                    padding: '0.35rem 1rem', borderRadius: '0.5rem',
                    background: isWin ? 'rgba(34,197,94,0.12)' : isLoss ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                    color: isWin ? '#22c55e' : isLoss ? '#ef4444' : 'rgba(255,255,255,0.25)',
                    fontFamily: "'Gotham Pro', sans-serif",
                  }}>
                    {isWin ? '↑ Победа' : isLoss ? '↓ Поражение' : '—'}
                  </span>
                </div>
                <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {game.players_info?.length ?? 0} игроков
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1.4rem', padding: '1.8rem 2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: '10rem', height: '10rem', borderRadius: '50%', background: `radial-gradient(ellipse, ${color}1a 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.8rem' }}>{label}</div>
      <div style={{ fontSize: '3.2rem', fontWeight: 900, color, fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{value}</div>
    </div>
  )
}
