'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { walletApi } from '@/lib/api'
import type { User } from '@/types'

type Method = 'payout_card' | 'payout_binance' | 'payout_card_sbp' | 'payout_card_uzcard'

const METHODS: { id: Method; label: string; desc: string; icon: React.ReactNode; currency: string }[] = [
  {
    id: 'payout_card',
    label: 'Банковская карта',
    desc: 'Visa / Mastercard',
    currency: 'KZT',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'payout_binance',
    label: 'Binance Pay',
    desc: 'Криптовалюта',
    currency: 'USDT',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'payout_card_sbp',
    label: 'СБП',
    desc: 'Система быстрых платежей',
    currency: 'RUB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'payout_card_uzcard',
    label: 'UzCard',
    desc: 'Узбекистан',
    currency: 'UZS',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><circle cx="8" cy="14" r="2"/><circle cx="12" cy="14" r="2"/>
      </svg>
    ),
  },
]

const PRESETS = [500, 1000, 2500, 5000, 10000]

export default function WithdrawalPage() {
  const { data: session } = useSession()
  const user = session?.user as unknown as User
  const router = useRouter()

  const [method, setMethod] = useState<Method>('payout_card')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedMethod = METHODS.find(m => m.id === method)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!amount || Number(amount) <= 0) { setError('Введите сумму'); return }
    setLoading(true)
    try {
      await walletApi.replenish({
        payment_amount: Number(amount),
        customer_id: user.id,
        payment_method: method,
      })
      setSuccess('Заявка на вывод создана')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Ошибка при выводе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: '#080710', padding: '3.2rem', display: 'flex', flexDirection: 'column', gap: '2.4rem', maxWidth: '72rem', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em', margin: 0 }}>
            Вывод средств
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)', margin: '0.3rem 0 0' }}>
            Выберите метод и укажите сумму
          </p>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div style={{ padding: '1.4rem 1.8rem', borderRadius: '1.2rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '1.4rem 1.8rem', borderRadius: '1.2rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Payment methods */}
        <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', padding: '2.4rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1.6rem' }}>
            Способ вывода
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            {METHODS.map((m) => {
              const active = method === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.4rem',
                    padding: '1.6rem 1.8rem', borderRadius: '1.2rem', cursor: 'pointer',
                    background: active ? 'linear-gradient(135deg, rgba(141,94,244,0.18) 0%, rgba(96,64,212,0.12) 100%)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1.5px solid rgba(141,94,244,0.6)' : '1.5px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.18s', textAlign: 'left',
                    boxShadow: active ? '0 0 20px rgba(141,94,244,0.12)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.35)'; e.currentTarget.style.background = 'rgba(141,94,244,0.06)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
                >
                  <div style={{
                    width: '4.2rem', height: '4.2rem', borderRadius: '1rem', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'rgba(141,94,244,0.2)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#b999fd' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.18s',
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: active ? '#fff' : 'rgba(255,255,255,0.75)', marginBottom: '0.3rem', transition: 'color 0.18s' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '1.2rem', color: active ? 'rgba(185,153,253,0.7)' : 'rgba(255,255,255,0.3)', transition: 'color 0.18s' }}>
                      {m.desc}
                    </div>
                  </div>
                  {active && (
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(141,94,244,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Amount */}
        <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', padding: '2.4rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1.6rem' }}>
            Сумма
          </div>

          {/* Preset chips */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.6rem', flexWrap: 'wrap' }}>
            {PRESETS.map(preset => {
              const active = amount === String(preset)
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  style={{
                    padding: '0.8rem 1.6rem', borderRadius: '0.8rem', cursor: 'pointer',
                    fontSize: '1.4rem', fontWeight: 600,
                    background: active ? 'linear-gradient(135deg, rgba(141,94,244,0.25) 0%, rgba(96,64,212,0.18) 100%)' : 'rgba(255,255,255,0.04)',
                    border: active ? '1.5px solid rgba(141,94,244,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                    color: active ? '#d4b8ff' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.4)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
                >
                  {preset.toLocaleString('ru')}
                </button>
              )
            })}
          </div>

          {/* Manual input */}
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Введите сумму"
              min={1}
              style={{
                width: '100%', padding: '1.5rem 6rem 1.5rem 1.8rem',
                borderRadius: '1.2rem', fontSize: '1.6rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                color: '#fff', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
            <span style={{ position: 'absolute', right: '1.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.3rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', pointerEvents: 'none' }}>
              {selectedMethod.currency}
            </span>
          </div>
        </div>

        {/* Summary bar */}
        {amount && Number(amount) > 0 && (
          <div style={{ background: 'linear-gradient(135deg, rgba(141,94,244,0.1) 0%, rgba(96,64,212,0.06) 100%)', border: '1px solid rgba(141,94,244,0.25)', borderRadius: '1.4rem', padding: '1.8rem 2.4rem', display: 'flex', alignItems: 'center', gap: '2.4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', gap: '2.4rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Метод</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#d4b8ff' }}>{selectedMethod.label}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Сумма</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff' }}>{Number(amount).toLocaleString('ru')} {selectedMethod.currency}</div>
              </div>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Срок: 1–3 рабочих дня
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '1.8rem', borderRadius: '1.4rem', cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', fontWeight: 600,
              transition: 'all 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1.8rem', borderRadius: '1.4rem', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(141,94,244,0.4)' : 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
              border: 'none', color: '#fff', fontSize: '1.6rem', fontWeight: 700,
              fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(141,94,244,0.35)',
              transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 8px 32px rgba(141,94,244,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(141,94,244,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {!loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)', pointerEvents: 'none' }} />
            )}
            {loading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Обработка...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                Вывести средства
              </>
            )}
          </button>
        </div>

      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
