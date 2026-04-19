import { auth } from '@/auth'
import Link from 'next/link'
import axios from 'axios'
import { ActionButtons } from './ActionButtons'
import { HeroBanner } from './HeroBanner'
import type { User, UserWallet, GameHistory } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getDashboardData(token: string, userId: number) {
  const headers = { Authorization: `Token ${token}` }
  const [userRes, walletRes, historyRes, commissionRes] = await Promise.allSettled([
    axios.get(`${API_URL}/auth/data/`, { headers }),
    axios.get(`${API_URL}/monetix/wallet/`, { headers }),
    axios.get(`${API_URL}/dota/game_history/`, { headers }),
    axios.get(`${API_URL}/dota/get_user_game_current_commission/?user_id=${userId}`, { headers }),
  ])
  return {
    freshUser: userRes.status === 'fulfilled' ? (userRes.value.data as User) : null,
    wallet: walletRes.status === 'fulfilled' ? (walletRes.value.data as UserWallet) : null,
    history: historyRes.status === 'fulfilled' ? (historyRes.value.data as GameHistory[]) : [],
    commission: commissionRes.status === 'fulfilled' ? commissionRes.value.data : null,
  }
}

const RANK_LABELS: Record<number, string> = {
  1: 'Herald', 2: 'Herald+', 3: 'Guardian', 4: 'Guardian+',
  5: 'Crusader', 6: 'Crusader+', 7: 'Archon', 8: 'Archon+',
  9: 'Legend', 10: 'Ancient+',
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export default async function CabinetPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!
  const sessionUser = session!.user as unknown as User
  const { freshUser, wallet, history, commission } = await getDashboardData(token, sessionUser.id)
  const user = freshUser ?? sessionUser

  const commissionPct = commission?.commission ?? 15
  const gamesToReduce = commission?.games_to_reduce ?? 0
  const balanceVal = wallet?.balance ?? 0
  const bonusVal = wallet?.bonus_balance ?? 0
  const currency = 'очков'
  const progressPct = gamesToReduce > 0 ? Math.max(3, 100 - (gamesToReduce / 10) * 100) : 100

  const wins = history.filter(h => h.result === 'DOTA_GC_TEAM_GOOD_GUYS').length
  const losses = history.filter(h => h.result === 'DOTA_GC_TEAM_BAD_GUYS').length
  const totalGames = history.length
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  // Calculate current streak
  let streak = 0
  let streakType: 'win' | 'loss' | null = null
  for (const h of history) {
    const isWin = h.result === 'DOTA_GC_TEAM_GOOD_GUYS'
    const isLoss = h.result === 'DOTA_GC_TEAM_BAD_GUYS'
    if (streak === 0) {
      if (isWin) { streakType = 'win'; streak = 1 }
      else if (isLoss) { streakType = 'loss'; streak = 1 }
    } else if ((streakType === 'win' && isWin) || (streakType === 'loss' && isLoss)) {
      streak++
    } else break
  }

  const recentHistory = history.slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', padding: '2rem 2.4rem' }}>

      {/* ── Hero Banner ── */}
      <HeroBanner
        username={user.username || user.email?.split('@')[0] || ''}
        mmr={user.dota_mmr}
        steamConnected={!!user.steam_id}
      />

      {/* ── Greeting row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
          <div style={{
            width: '4.2rem', height: '4.2rem', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8D5EF4, #B999FD)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.7rem', fontWeight: 700,
            flexShrink: 0,             fontFamily: "'Gotham Pro', sans-serif",
          }}>
            {(user.username || user.email)?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(185,153,253,0.6)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '0.3rem' }}>
              Добро пожаловать
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>
              {user.username || user.email?.split('@')[0]}
            </div>
          </div>
        </div>
        {user.dota_rank ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1.4rem', borderRadius: '0.8rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/><path d="M4 22h16"/></svg>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', fontFamily: "'Gotham Pro', sans-serif" }}>
              {RANK_LABELS[user.dota_rank] ?? 'Herald'}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Primary stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
        <StatCard
          label="Очки" value={balanceVal.toLocaleString('ru-RU')} sub={currency}
          color="#22c55e" glow="rgba(34,197,94,0.15)"
          badge={bonusVal > 0 ? `+${bonusVal} бонус` : undefined}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
        />
        <StatCard
          label="MMR" value={String(user.dota_mmr ?? 0)} sub="Dota 2"
          color="#8D5EF4" glow="rgba(141,94,244,0.15)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <StatCard
          label="Ранг" value={RANK_LABELS[user.dota_rank ?? 1] ?? '—'} sub="Текущий"
          color="#f59e0b" glow="rgba(245,158,11,0.12)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/><path d="M4 22h16"/></svg>}
        />
        <StatCard
          label="Рейтинг" value={(user.service_rating ?? 5).toFixed(1)} sub="Сервисный"
          color="#e879f9" glow="rgba(232,121,249,0.12)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
      </div>

      {/* ── Secondary stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>

        {/* Win rate */}
        <div style={glassCard}>
          <div style={cardLabel}>Процент побед</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '4rem', fontWeight: 900, color: winRate >= 50 ? '#22c55e' : '#ef4444', fontFamily: "'Colus', sans-serif", lineHeight: 1,  }}>
              {winRate}%
            </span>
            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", paddingBottom: '0.5rem' }}>
              {wins}П / {losses}П
            </span>
          </div>
          {/* Win rate bar */}
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${winRate}%`, background: winRate >= 50 ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #b91c1c, #ef4444)', borderRadius: '3px',  }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '1rem', color: 'rgba(255,255,255,0.15)', fontFamily: "'Gotham Pro', sans-serif" }}>
            <span>{totalGames} {plural(totalGames, 'игра', 'игры', 'игр')}</span>
            <span>100%</span>
          </div>
        </div>

        {/* Streak */}
        <div style={glassCard}>
          <div style={cardLabel}>Текущая серия</div>
          {streak > 0 && streakType ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, color: streakType === 'win' ? '#22c55e' : '#ef4444', fontFamily: "'Colus', sans-serif",  }}>
                  {streak}
                </span>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: streakType === 'win' ? '#22c55e' : '#ef4444', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {streakType === 'win' ? '↑ Победы' : '↓ Поражения'}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>подряд</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {Array.from({ length: Math.min(streak, 8) }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: streakType === 'win' ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',  }} />
                ))}
                {Array.from({ length: Math.max(0, 8 - streak) }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '8rem', gap: '0.8rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет данных</span>
            </div>
          )}
        </div>

        {/* Commission */}
        <div style={{ ...glassCard, position: 'relative', overflow: 'hidden' }}>
          <div style={cardLabel}>Комиссия</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '4rem', fontWeight: 900, color: '#8D5EF4', fontFamily: "'Colus', sans-serif", lineHeight: 1,  }}>
              {commissionPct}%
            </span>
            {gamesToReduce > 0 && (
              <span style={{ fontSize: '1.1rem', color: 'rgba(185,153,253,0.5)', fontFamily: "'Gotham Pro', sans-serif", paddingBottom: '0.5rem' }}>→ {commissionPct - 5}%</span>
            )}
          </div>
          <div style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.28)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1rem', lineHeight: 1.5 }}>
            {gamesToReduce > 0
              ? `${gamesToReduce} ${plural(gamesToReduce, 'игра', 'игры', 'игр')} до снижения`
              : 'Минимальная комиссия'}
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #6B3FD4, #B999FD)', borderRadius: '3px',  }} />
          </div>
        </div>
      </div>

      {/* ── Recent Games ── */}
      <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.8rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3px', height: '1.6rem', borderRadius: '2px', background: 'linear-gradient(180deg, #8D5EF4, #B999FD)' }} />
            <span style={cardLabel}>Последние игры</span>
          </div>
          <Link href="/cabinet/history" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'rgba(185,153,253,0.7)', textDecoration: 'none', fontFamily: "'Gotham Pro', sans-serif", fontWeight: 600, transition: 'color 0.2s' }}>
            Все игры
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        {recentHistory.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '14rem', gap: '1.2rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет сыгранных игр</span>
            <Link href="/cabinet/lobby" style={{ marginTop: '0.4rem', fontSize: '1.3rem', fontWeight: 700, color: '#8D5EF4', textDecoration: 'none', fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.05em' }}>
              Найти лобби →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {recentHistory.map((h, i) => {
              const isWin = h.result === 'DOTA_GC_TEAM_GOOD_GUYS'
              const isLoss = h.result === 'DOTA_GC_TEAM_BAD_GUYS'
              const color = isWin ? '#22c55e' : isLoss ? '#ef4444' : 'rgba(255,255,255,0.2)'
              const bg = isWin ? 'rgba(34,197,94,0.04)' : isLoss ? 'rgba(239,68,68,0.04)' : 'transparent'
              const borderColor = isWin ? 'rgba(34,197,94,0.1)' : isLoss ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)'
              return (
                <div key={h.id} style={{
                  padding: '1.6rem 2rem', background: bg,
                  borderRight: i % 3 < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  borderBottom: i < 3 && recentHistory.length > 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  borderTop: `2px solid ${borderColor}`,
                  display: 'flex', flexDirection: 'column' as const, gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: "'Gotham Pro', sans-serif" }}>
                      {isWin ? '↑ ПОБЕДА' : isLoss ? '↓ ПОРАЖЕНИЕ' : '— —'}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>#{h.id}</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {new Date(h.start_game).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    Лобби {h.lobby_link ?? '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <ActionButtons />

    </div>
  )
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '1.4rem',
  padding: '2rem 2.2rem',
}

const cardLabel: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.22)',
  fontFamily: "'Gotham Pro', sans-serif",
  marginBottom: '1rem',
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color, glow, badge }: {
  label: string; value: string; sub: string; icon: React.ReactNode
  color: string; glow: string; badge?: string
}) {
  return (
    <div style={{
      background: `linear-gradient(145deg, #0f0e17 0%, #0c0b14 100%)`,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '1.4rem', padding: '1.8rem 2rem',
      display: 'flex', flexDirection: 'column', gap: '0.6rem',
      position: 'relative', overflow: 'hidden',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.22)', fontFamily: "'Gotham Pro', sans-serif" }}>
          {label}
        </span>
        <div style={{ color, opacity: 0.85 }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>
          {sub}
        </span>
        {badge && (
          <span style={{ fontSize: '1rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '0.4rem', background: `${color}18`, border: `1px solid ${color}35`, color, fontFamily: "'Gotham Pro', sans-serif" }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
