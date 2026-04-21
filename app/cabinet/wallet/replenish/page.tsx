'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { walletApi } from '@/lib/api'
import type { User } from '@/types'

type Method = 'payment_page_card' | 'payment_page_binance' | 'payment_page_sbp'

const METHODS: { id: Method; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'payment_page_card',
    label: 'Банковская карта',
    desc: 'Visa / Mastercard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'payment_page_binance',
    label: 'Binance Pay',
    desc: 'USDT / BNB',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2ZM2 12L4 10L6 12L4 14L2 12ZM18 12L20 10L22 12L20 14L18 12ZM8.5 14.5L12 11L15.5 14.5L12 18L8.5 14.5ZM12 22L6.5 16.5L8.5 14.5L12 18L15.5 14.5L17.5 16.5L12 22Z"/>
      </svg>
    ),
  },
  {
    id: 'payment_page_sbp',
    label: 'СБП',
    desc: 'Быстрый перевод (RUB)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
      </svg>
    ),
  },
]

const QUICK_AMOUNTS = [100, 500, 1000, 5000]

export default function ReplenishPage() {
  const { data: session } = useSession()
  const user = session?.user as unknown as User
  const router = useRouter()

  const [method, setMethod] = useState<Method>('payment_page_card')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!amount || Number(amount) <= 0) { setError('Введите сумму'); return }
    setLoading(true)
    try {
      const res = await walletApi.replenish({
        payment_amount: Number(amount),
        customer_id: user.id,
        payment_method: method,
      })
      if (res.data.payment_link_encrypted) {
        window.location.href = res.data.payment_link_encrypted
      }
    } catch {
      setError('Ошибка при создании платежа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '3.2rem 3.2rem 3.2rem 4rem', maxWidth: '100%', boxSizing: 'border-box' }}>

      {/* Coming soon banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '1.4rem 2rem', borderRadius: '1.2rem', background: 'linear-gradient(135deg, rgba(141,94,244,0.12) 0%, rgba(56,189,248,0.08) 100%)', border: '1px solid rgba(141,94,244,0.3)', marginBottom: '2.4rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(185,153,253,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Gotham Pro', sans-serif" }}>Пополнение скоро будет доступно</span>
        <div style={{ marginLeft: 'auto', flexShrink: 0, padding: '0.3rem 0.9rem', borderRadius: '2rem', background: 'rgba(141,94,244,0.25)', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(185,153,253,0.9)', fontFamily: "'Gotham Pro', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Скоро</div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[4rem] h-[4rem] rounded-[1.2rem] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(141,94,244,0.2), rgba(141,94,244,0.08))', border: '1px solid rgba(141,94,244,0.3)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8D5EF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Пополнение</h1>
          <p style={{ fontSize: '1.3rem', color: '#666', marginTop: '0.2rem' }}>Выберите способ оплаты и введите сумму</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-[1rem] text-[1.4rem] text-red-400"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Payment methods */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1.6rem', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.6rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Способ оплаты</span>
          </div>
          <div style={{ padding: '0.8rem' }}>
            {METHODS.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.4rem',
                  padding: '1.4rem 1.6rem',
                  borderRadius: '1rem',
                  border: method === m.id ? '1px solid rgba(141,94,244,0.5)' : '1px solid transparent',
                  background: method === m.id ? 'rgba(141,94,244,0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  marginBottom: i < METHODS.length - 1 ? '0.4rem' : 0,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '3.6rem', height: '3.6rem', borderRadius: '0.8rem', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: method === m.id ? 'rgba(141,94,244,0.2)' : 'rgba(255,255,255,0.05)',
                  color: method === m.id ? '#B999FD' : '#666',
                  border: method === m.id ? '1px solid rgba(141,94,244,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s',
                }}>
                  {m.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: method === m.id ? '#fff' : '#ccc' }}>{m.label}</div>
                  <div style={{ fontSize: '1.2rem', color: '#555', marginTop: '0.2rem' }}>{m.desc}</div>
                </div>

                {/* Radio */}
                <div style={{
                  width: '1.8rem', height: '1.8rem', borderRadius: '50%',
                  border: method === m.id ? '5px solid #8D5EF4' : '2px solid #444',
                  background: 'transparent',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1.6rem', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.6rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Сумма</span>
          </div>
          <div style={{ padding: '1.6rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Quick amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  style={{
                    padding: '0.9rem',
                    borderRadius: '0.8rem',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: amount === String(q) ? '1px solid rgba(141,94,244,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: amount === String(q) ? 'rgba(141,94,244,0.15)' : 'rgba(255,255,255,0.04)',
                    color: amount === String(q) ? '#B999FD' : '#888',
                  }}
                >
                  {q} pts
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Или введите свою сумму"
                min={1}
                style={{
                  width: '100%',
                  padding: '1.4rem 5rem 1.4rem 1.6rem',
                  borderRadius: '1rem',
                  fontSize: '1.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.5)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <span style={{ position: 'absolute', right: '1.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#555', fontWeight: 600 }}>pts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '1.5rem',
              borderRadius: '1.2rem',
              fontSize: '1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              border: '1.5px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#888',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#888' }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1.5rem',
              borderRadius: '1.2rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              background: loading ? 'rgba(141,94,244,0.4)' : 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
              color: '#fff',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Создание...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                Перейти к оплате
              </>
            )}
          </button>
        </div>

      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
