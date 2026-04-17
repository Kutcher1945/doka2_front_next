import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import type { GameHistory, User, UserWallet } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const OPENDOTA = 'https://api.opendota.com/api'
const STEAM64_BASE = BigInt('76561197960265728')

const RANK_LABELS: Record<number, string> = {
  1: 'Herald', 2: 'Herald+', 3: 'Guardian', 4: 'Guardian+',
  5: 'Crusader', 6: 'Crusader+', 7: 'Archon', 8: 'Archon+',
  9: 'Legend', 10: 'Ancient+',
}
const RANK_COLORS: Record<number, string> = {
  1: '#6c7a89', 2: '#6c7a89', 3: '#27ae60', 4: '#27ae60',
  5: '#e67e22', 6: '#e67e22', 7: '#3498db', 8: '#3498db',
  9: '#9b59b6', 10: '#e74c3c',
}

interface OdotaWL { win: number; lose: number }
interface OdotaMatch {
  match_id: number
  hero_id: number
  kills: number
  deaths: number
  assists: number
  duration: number
  game_mode: number
  radiant_win: boolean
  player_slot: number
  start_time: number
}
interface OdotaHeroStat {
  hero_id: number
  games: number
  win: number
  last_played: number
}
interface OdotaHero { id: number; name: string; localized_name: string }

function steamToAccountId(steam64: string): number | null {
  try {
    return Number(BigInt(steam64) - STEAM64_BASE)
  } catch { return null }
}

function heroImgUrl(heroName: string) {
  const short = heroName.replace('npc_dota_hero_', '')
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/${short}_icon.png`
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default async function ProfilePage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token ?? ''
  if (!token) redirect('/')

  const headers = { Authorization: `Token ${token}` }

  const [userRes, historyRes, walletRes] = await Promise.allSettled([
    axios.get(`${API_URL}/auth/data/`, { headers }),
    axios.get(`${API_URL}/dota/game_history/`, { headers }),
    axios.get(`${API_URL}/monetix/wallet/`, { headers }),
  ])

  if (userRes.status === 'rejected') redirect('/')

  const user = userRes.value.data as User
  const history: GameHistory[] = historyRes.status === 'fulfilled' ? historyRes.value.data : []
  const wallet: UserWallet | null = walletRes.status === 'fulfilled' ? walletRes.value.data : null

  const wins = history.filter(g => g.result === 'DOTA_GC_TEAM_GOOD_GUYS').length
  const losses = history.filter(g => g.result === 'DOTA_GC_TEAM_BAD_GUYS').length
  const total = history.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const recent = [...history].reverse().slice(0, 5)

  const rankColor = RANK_COLORS[user.dota_rank ?? 1] ?? '#f59e0b'
  const rankLabel = RANK_LABELS[user.dota_rank ?? 1] ?? '—'
  const initials = (user.username || user.email)?.[0]?.toUpperCase() ?? '?'

  // OpenDota — only if steam connected
  const accountId = user.steam_id ? steamToAccountId(user.steam_id) : null

  let odotaWL: OdotaWL | null = null
  let odotaMatches: OdotaMatch[] = []
  let odotaTopHeroes: OdotaHeroStat[] = []
  let heroMap: Record<number, OdotaHero> = {}

  if (accountId) {
    const [wlRes, matchesRes, heroStatsRes, heroesRes] = await Promise.allSettled([
      axios.get(`${OPENDOTA}/players/${accountId}/wl?limit=20`),
      axios.get(`${OPENDOTA}/players/${accountId}/recentMatches`),
      axios.get(`${OPENDOTA}/players/${accountId}/heroes?limit=5`),
      axios.get(`${OPENDOTA}/heroes`),
    ])
    if (wlRes.status === 'fulfilled') odotaWL = wlRes.value.data
    if (matchesRes.status === 'fulfilled') odotaMatches = matchesRes.value.data?.slice(0, 8) ?? []
    if (heroStatsRes.status === 'fulfilled') {
      odotaTopHeroes = (heroStatsRes.value.data as OdotaHeroStat[])
        .filter(h => h.games >= 1)
        .sort((a, b) => b.games - a.games)
        .slice(0, 5)
    }
    if (heroesRes.status === 'fulfilled') {
      heroMap = Object.fromEntries((heroesRes.value.data as OdotaHero[]).map(h => [h.id, h]))
    }
  }

  const odotaTotal = odotaWL ? odotaWL.win + odotaWL.lose : 0
  const odotaWinRate = odotaTotal > 0 ? Math.round((odotaWL!.win / odotaTotal) * 100) : 0

  return (
    <div style={{ padding: '2.4rem 3.2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>Профиль</h1>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', margin: '0.4rem 0 0' }}>Ваши данные и статистика</p>
        </div>
        <Link href="/cabinet/profile/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 1.8rem', borderRadius: '0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '1.3rem', fontWeight: 600, textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Настройки
        </Link>
      </div>

      {/* Hero card */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2rem', padding: '3.2rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '3.2rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '-6rem', top: '-6rem', width: '40rem', height: '40rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(141,94,244,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-4rem', bottom: '-4rem', width: '30rem', height: '30rem', borderRadius: '50%', background: `radial-gradient(ellipse, ${rankColor}0d 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: '10rem', height: '10rem', borderRadius: '50%', background: 'linear-gradient(135deg, #8D5EF4, #B999FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", boxShadow: '0 0 40px rgba(141,94,244,0.45)' }}>
            {initials}
          </div>
          <div style={{ position: 'absolute', bottom: '0.4rem', right: '0.4rem', width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: user.online_status === 'online' ? '#22c55e' : '#6b7280', border: '3px solid #0c0b14' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '3.2rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.1 }}>{user.username || 'Без ника'}</h2>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0.4rem 1rem', borderRadius: '0.6rem', background: `${rankColor}22`, border: `1px solid ${rankColor}55`, color: rankColor, textTransform: 'uppercase' }}>{rankLabel}</span>
          </div>
          <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.2rem' }}>
            {user.email}{user.phone_number && <span style={{ marginLeft: '1.2rem', color: 'rgba(255,255,255,0.2)' }}>· {user.phone_number}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2rem', padding: '0.35rem 1rem', borderRadius: '0.5rem', background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.28)', color: '#C9AAFF', fontWeight: 600 }}>Сезон 3 · Бета</span>
            {user.steam_id ? (
              <span style={{ fontSize: '1.2rem', padding: '0.35rem 1rem', borderRadius: '0.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Steam подключён
              </span>
            ) : (
              <a href={`/api/auth/steam?token=${token}`} style={{ fontSize: '1.2rem', padding: '0.35rem 1rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Подключить Steam
              </a>
            )}
            <span style={{ fontSize: '1.2rem', padding: '0.35rem 1rem', borderRadius: '0.5rem', background: user.online_status === 'online' ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${user.online_status === 'online' ? 'rgba(34,197,94,0.22)' : 'rgba(255,255,255,0.08)'}`, color: user.online_status === 'online' ? '#22c55e' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {user.online_status === 'online' ? '● В сети' : '○ Не в сети'}
            </span>
          </div>
        </div>
        {wallet && wallet.balance != null && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', marginBottom: '0.6rem' }}>Баланс</div>
            <div style={{ fontSize: '3.2rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{Number(wallet.balance).toLocaleString('ru')}</div>
            <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>{wallet.currency}</div>
            {wallet.bonus_balance != null && Number(wallet.bonus_balance) > 0 && (
              <div style={{ marginTop: '0.8rem', fontSize: '1.2rem', color: '#f59e0b', fontWeight: 600 }}>+ {Number(wallet.bonus_balance).toLocaleString('ru')} бонусных</div>
            )}
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.2rem' }}>
        <StatCard label="MMR" value={String(user.dota_mmr ?? 0)} color="#8D5EF4" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
        <StatCard label="Ранг" value={rankLabel} color={rankColor} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
        <StatCard label="Рейтинг" value={`${(user.service_rating ?? 5).toFixed(1)}`} color="#f59e0b" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        <StatCard label="Победы" value={odotaWL ? String(odotaWL.win) : String(wins)} color="#22c55e" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} />
        <StatCard label="Винрейт" value={odotaWL ? (odotaTotal > 0 ? `${odotaWinRate}%` : '—') : (total > 0 ? `${winRate}%` : '—')} color={(odotaWL ? odotaWinRate : winRate) >= 50 ? '#22c55e' : '#ef4444'} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
      </div>

      {/* Main body: left feed + right sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 34rem', gap: '1.6rem', alignItems: 'start' }}>

        {/* ── LEFT: activity feed ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

          {/* Dota 2 recent matches */}
          <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.6rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>Последние матчи</div>
                <span style={{ fontSize: '1.1rem', padding: '0.2rem 0.7rem', borderRadius: '0.5rem', background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.2)', color: '#b999fd', fontWeight: 600 }}>Dota 2</span>
              </div>
              {accountId && (
                <a href={`https://www.dotabuff.com/players/${accountId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem', color: 'rgba(141,94,244,0.7)', textDecoration: 'none', fontWeight: 600 }}>Dotabuff →</a>
              )}
            </div>
            {odotaMatches.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}>
                <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.15)' }}>{accountId ? 'Нет данных' : 'Подключите Steam для просмотра матчей'}</span>
              </div>
            ) : (
              odotaMatches.map((m, i) => {
                const isRadiant = m.player_slot < 128
                const isWin = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win)
                const hero = heroMap[m.hero_id]
                return (
                  <div key={m.match_id} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto auto', padding: '1rem 2rem', gap: '1.4rem', alignItems: 'center', borderBottom: i < odotaMatches.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isWin ? 'rgba(34,197,94,0.02)' : 'rgba(239,68,68,0.02)' }}>
                    <div style={{ width: '0.3rem', height: '3rem', borderRadius: '0.2rem', background: isWin ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                    {hero ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={heroImgUrl(hero.name)} alt={hero.localized_name} width={34} height={24} style={{ borderRadius: '0.4rem', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '3.4rem', height: '2.4rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.06)' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 600, color: isWin ? '#22c55e' : '#ef4444' }}>
                        {isWin ? 'Победа' : 'Поражение'}
                        {hero && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> · {hero.localized_name}</span>}
                      </div>
                      <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.2rem' }}>
                        {new Date(m.start_time * 1000).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} · {fmtDuration(m.duration)}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textAlign: 'center' as const, minWidth: '6rem' }}>
                      <span style={{ color: '#22c55e' }}>{m.kills}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                      <span style={{ color: '#ef4444' }}>{m.deaths}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
                      <span style={{ color: 'rgba(255,255,255,0.55)' }}>{m.assists}</span>
                    </div>
                    <a href={`https://www.dotabuff.com/matches/${m.match_id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.12)', textDecoration: 'none', fontSize: '1.4rem', lineHeight: 1 }}>↗</a>
                  </div>
                )
              })
            )}
          </div>

          {/* Platform matches */}
          <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.6rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>Матчи на платформе</div>
              <Link href="/cabinet/history" style={{ fontSize: '1.2rem', color: 'rgba(141,94,244,0.7)', textDecoration: 'none', fontWeight: 600 }}>Все →</Link>
            </div>
            {recent.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '10rem' }}>
                <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.15)' }}>Нет сыгранных игр</span>
              </div>
            ) : (
              recent.map((game, i) => {
                const isWin = game.result === 'DOTA_GC_TEAM_GOOD_GUYS'
                const isLoss = game.result === 'DOTA_GC_TEAM_BAD_GUYS'
                return (
                  <div key={game.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', padding: '1rem 2rem', gap: '1.4rem', alignItems: 'center', borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isWin ? 'rgba(34,197,94,0.02)' : isLoss ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                    <div style={{ width: '0.3rem', height: '3rem', borderRadius: '0.2rem', background: isWin ? '#22c55e' : isLoss ? '#ef4444' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 600, color: isWin ? '#22c55e' : isLoss ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>{isWin ? 'Победа' : isLoss ? 'Поражение' : 'Неизвестно'}</div>
                      <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.22)', marginTop: '0.2rem' }}>{new Date(game.start_game).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.22)' }}>{game.players_info?.length ?? 0} игр.</div>
                    <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.18)' }}>#{game.lobby_link}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

          {/* W/L summary */}
          {odotaWL && odotaTotal > 0 && (
            <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', padding: '2rem 2.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>Статистика Dota 2</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{odotaTotal}<span style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: '0.5rem' }}>игр</span></div>
              </div>
              <div style={{ height: '0.8rem', borderRadius: '1rem', background: 'rgba(239,68,68,0.2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${odotaWinRate}%`, borderRadius: '1rem', background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{odotaWL.win}В · {odotaWinRate}%</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{odotaWL.lose}П</span>
              </div>
            </div>
          )}

          {/* Top heroes */}
          <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.6rem 2.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>Топ герои</div>
              <span style={{ fontSize: '1.1rem', padding: '0.2rem 0.7rem', borderRadius: '0.5rem', background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.2)', color: '#b999fd', fontWeight: 600 }}>Dota 2</span>
            </div>
            {odotaTopHeroes.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '10rem' }}>
                <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.15)' }}>{accountId ? 'Нет данных' : 'Steam не подключён'}</span>
              </div>
            ) : (
              odotaTopHeroes.map((hs, i) => {
                const hero = heroMap[hs.hero_id]
                const wr = Math.round((hs.win / hs.games) * 100)
                return (
                  <div key={hs.hero_id} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', padding: '1.1rem 2rem', gap: '1.2rem', alignItems: 'center', borderBottom: i < odotaTopHeroes.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.15)', width: '1.4rem', textAlign: 'center' as const }}>{i + 1}</div>
                    {hero ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={heroImgUrl(hero.name)} alt={hero.localized_name} width={34} height={24} style={{ borderRadius: '0.4rem', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '3.4rem', height: '2.4rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.06)' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{hero?.localized_name ?? `Hero ${hs.hero_id}`}</div>
                      <div style={{ marginTop: '0.4rem', height: '0.3rem', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${wr}%`, borderRadius: '0.3rem', background: wr >= 50 ? '#22c55e' : '#ef4444' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: wr >= 50 ? '#22c55e' : '#ef4444' }}>{wr}%</div>
                      <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>{hs.games}г</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Account details */}
          <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.6rem 2.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>Аккаунт</div>
            </div>
            <div style={{ padding: '0.4rem 0' }}>
              <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="Никнейм" value={user.username || '—'} />
              <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} label="Email" value={user.email} />
              {user.phone_number && <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} label="Телефон" value={user.phone_number} />}
              <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} label="Steam ID" value={user.steam_id ?? '—'} highlight={!!user.steam_id} />
              <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>} label="ID" value={`#${user.id}`} />
              {wallet && wallet.currency && (
                <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} label="Валюта" value={wallet.currency} />
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.4rem', padding: '1.8rem 2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: '12rem', height: '12rem', borderRadius: '50%', background: `radial-gradient(ellipse, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
        <div style={{ color: `${color}99` }}>{icon}</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)' }}>{label}</div>
      </div>
      <div style={{ fontSize: '2.8rem', fontWeight: 900, color, fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function InfoRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2.4rem 1fr auto', gap: '1.2rem', padding: '1.2rem 2.4rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 600, color: highlight ? '#22c55e' : 'rgba(255,255,255,0.7)', textAlign: 'right' as const, maxWidth: '18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{value}</div>
    </div>
  )
}
