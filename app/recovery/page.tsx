'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

function RecoveryForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [passwordCopy, setPasswordCopy] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordCopy) {
      setMsg({ type: 'error', text: 'Пароли не совпадают' }); return
    }
    if (!token) {
      setMsg({ type: 'error', text: 'Неверная ссылка восстановления' }); return
    }
    setLoading(true); setMsg(null)
    try {
      await authApi.restorePasswordSubmit(token, password, passwordCopy)
      setMsg({ type: 'success', text: 'Пароль изменён! Перенаправление...' })
      setTimeout(() => router.push('/'), 2000)
    } catch {
      setMsg({ type: 'error', text: 'Ссылка недействительна или истекла' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0e] flex items-center justify-center p-4">
      <div className="bg-[#141415] border border-[#323232] rounded-[1.1rem] p-8 w-full max-w-[42rem]">
        <h1 className="text-[2.4rem] font-semibold mb-8 text-center text-white">
          Новый пароль
        </h1>

        {msg && (
          <div className={`mb-6 p-4 rounded-[0.8rem] border text-[1.4rem] ${
            msg.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Новый пароль"
            required
            className="w-full px-4 py-3 rounded-[0.5rem] bg-[#282829] border border-[#323232] text-white text-[1.4rem] placeholder:text-[#606060] focus:outline-none focus:border-[#754FE0] transition-colors"
          />
          <input
            type="password"
            value={passwordCopy}
            onChange={(e) => setPasswordCopy(e.target.value)}
            placeholder="Повторите пароль"
            required
            className="w-full px-4 py-3 rounded-[0.5rem] bg-[#282829] border border-[#323232] text-white text-[1.4rem] placeholder:text-[#606060] focus:outline-none focus:border-[#754FE0] transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-[0.5rem] bg-[#754FE0] text-white text-[1.4rem] font-medium hover:bg-[#6340cc] transition-colors disabled:opacity-60"
          >
            {loading ? 'Сохранение...' : 'Сохранить пароль'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RecoveryPage() {
  return (
    <Suspense>
      <RecoveryForm />
    </Suspense>
  )
}
