'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { walletApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

type Method = 'payment_page_card' | 'payment_page_binance' | 'payment_page_sbp'

const METHODS: { id: Method; label: string; desc: string }[] = [
  { id: 'payment_page_card', label: 'Банковская карта', desc: 'Visa / Mastercard' },
  { id: 'payment_page_binance', label: 'Binance Pay', desc: 'USDT / BNB' },
  { id: 'payment_page_sbp', label: 'СБП', desc: 'Быстрый перевод (RUB)' },
]

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
    <div className="max-w-[60rem] mx-auto">
      <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-8">
        <h1 className="text-[2.4rem] font-semibold mb-8 text-center">Пополнение</h1>

        {error && (
          <div className="mb-6 p-4 rounded-[0.8rem] bg-red-500/10 border border-red-500/30 text-red-400 text-[1.4rem]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method */}
          <div>
            <label className="block text-[1.3rem] text-[#878787] mb-3">Способ оплаты</label>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-[0.5rem] border transition-colors text-left',
                    method === m.id
                      ? 'border-[#754FE0] bg-[#754FE0]/10'
                      : 'border-[#323232] bg-[#282829] hover:border-[#754FE0]/50'
                  )}
                >
                  <span className="text-[1.4rem]">{m.label}</span>
                  <span className="text-[1.2rem] text-[#878787]">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[1.3rem] text-[#878787] mb-2">Сумма</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Введите сумму"
              min={1}
              className="w-full px-4 py-3 rounded-[0.5rem] bg-[#282829] border border-[#323232] text-white text-[1.4rem] placeholder:text-[#606060] focus:outline-none focus:border-[#754FE0] transition-colors"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-[0.5rem] border border-[#323232] text-[#878787] text-[1.4rem] hover:border-white hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-[0.5rem] bg-[#754FE0] text-white text-[1.4rem] font-medium hover:bg-[#6340cc] transition-colors disabled:opacity-60"
            >
              {loading ? 'Создание...' : 'Перейти к оплате'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
