import { auth } from '@/auth'
import Link from 'next/link'
import axios from 'axios'
import type { UserWallet, WalletHistory } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getWalletData(token: string) {
  const headers = { Authorization: `Token ${token}` }
  const [walletRes, historyRes] = await Promise.allSettled([
    axios.get(`${API_URL}/monetix/wallet/`, { headers }),
    axios.get(`${API_URL}/monetix/wallet_history/`, { headers }),
  ])
  return {
    wallet: walletRes.status === 'fulfilled' ? (walletRes.value.data as UserWallet) : null,
    history: historyRes.status === 'fulfilled' ? (historyRes.value.data as WalletHistory[]) : [],
  }
}

function statusColor(status: string | null | undefined) {
  if (status === 'success') return { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', label: 'Успешно' }
  if (status === 'decline') return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Отклонено' }
  if (status === 'pending') return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'В процессе' }
  return { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.3)', label: status || '—' }
}

function typeLabel(type: string | null) {
  if (type === 'purchase') return { text: 'Пополнение', color: '#22c55e' }
  if (type === 'payout') return { text: 'Вывод', color: '#C9AAFF' }
  return { text: '—', color: 'rgba(255,255,255,0.3)' }
}

const COLS = ['Дата', 'Тип', 'Сумма', 'Метод', 'Статус']

export default async function WalletPage() {
  const session = await auth()
  const token = (session as { auth_token?: string }).auth_token!
  const { wallet, history } = await getWalletData(token)
  const balance = wallet?.balance ?? 0
  const bonus = wallet?.bonus_balance ?? 0
  const blocked = wallet?.blocked_balance ?? 0
  const currency = 'очков'

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
          Кошелёк
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
          Управляйте очками и транзакциями
        </p>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.4rem' }}>
        {/* Main balance */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(141,94,244,0.15) 0%, rgba(107,63,212,0.08) 100%)',
          border: '1px solid rgba(141,94,244,0.3)',
          borderRadius: '1.4rem', padding: '2.4rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '14rem', height: '14rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(141,94,244,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(185,153,253,0.6)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1.2rem' }}>Основные очки</div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1, marginBottom: '0.4rem' }}>
            {balance.toLocaleString('ru-RU')}
          </div>
          <div style={{ fontSize: '1.3rem', color: 'rgba(185,153,253,0.7)', fontFamily: "'Gotham Pro', sans-serif" }}>{currency}</div>
        </div>

        {/* Bonus balance */}
        <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.4rem', padding: '2.4rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '14rem', height: '14rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1.2rem' }}>Бонусные очки</div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1, marginBottom: '0.4rem' }}>
            {bonus.toLocaleString('ru-RU')}
          </div>
          <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>{currency}</div>
        </div>

        {/* Blocked */}
        <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.4rem', padding: '2.4rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: '14rem', height: '14rem', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1.2rem' }}>Заблокировано</div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", lineHeight: 1, marginBottom: '0.4rem' }}>
            {blocked.toLocaleString('ru-RU')}
          </div>
          <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>{currency}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
        <Link
          href="/cabinet/wallet/replenish"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            padding: '1.6rem', borderRadius: '1.2rem', textDecoration: 'none',
            background: 'linear-gradient(135deg, #8D5EF4 0%, #6B3FD4 100%)',
            color: '#fff', fontSize: '1.6rem', fontWeight: 700,
            fontFamily: "'Gotham Pro', sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Пополнить
        </Link>
        <Link
          href="/cabinet/wallet/withdrawal"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            padding: '1.6rem', borderRadius: '1.2rem', textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)', fontSize: '1.6rem', fontWeight: 700,
            fontFamily: "'Gotham Pro', sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
          Вывести
        </Link>
      </div>

      {/* Transaction history */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.6rem', overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
            История транзакций
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '0.8rem 2.4rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          {COLS.map((c) => (
            <div key={c} style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.2)', fontFamily: "'Gotham Pro', sans-serif" }}>{c}</div>
          ))}
        </div>

        {history.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem', gap: '1.2rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>Нет транзакций</span>
          </div>
        ) : (
          history.map((t, i) => {
            const st = statusColor(t.status)
            const tp = typeLabel(t.type)
            return (
              <div key={t.payment_id} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr',
                padding: '1.2rem 2.4rem', alignItems: 'center',
                borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {new Date(t.pay_time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: tp.color, fontFamily: "'Gotham Pro', sans-serif" }}>
                  {tp.text}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {t.amount ? `${t.amount} ${t.currency}` : '—'}
                </div>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
                  {t.method ?? '—'}
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, padding: '0.3rem 0.9rem', borderRadius: '0.5rem', background: st.bg, color: st.text, fontFamily: "'Gotham Pro', sans-serif" }}>
                    {st.label}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
