'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { api } from '@/lib/api'

export type ModalType = 'signin' | 'signup' | 'recover' | null

interface AuthModalsProps {
  modal: ModalType
  setModal: (m: ModalType) => void
}

export function AuthModals({ modal, setModal }: AuthModalsProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const close = () => { setModal(null); setError(''); setSuccess('') }
  const openSignIn = () => { setModal('signin'); setError(''); setSuccess('') }
  const openSignUp = () => { setModal('signup'); setError(''); setSuccess('') }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Неверный email или пароль')
    } else {
      router.push('/cabinet')
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const re_password = fd.get('re_password') as string
    if (password !== re_password) {
      setError('Пароли не совпадают'); setLoading(false); return
    }
    try {
      const phone = fd.get('phone_number') as string
      const body: Record<string, string> = { email: fd.get('email') as string, password, re_password }
      if (phone?.trim()) body.phone_number = phone.trim()
      await api.post('/auth/users/', body)
      setSuccess('Аккаунт создан! Войдите в систему.')
      setModal('signin')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      if (data) {
        const firstError = Object.values(data).flat()[0]
        setError(firstError || 'Ошибка регистрации')
      } else {
        setError('Ошибка регистрации')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRecover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      await api.post('/auth/restore_password/', { email: fd.get('email') })
      setSuccess('Письмо отправлено. Проверьте почту.')
    } catch {
      setError('Пользователь не найден')
    } finally {
      setLoading(false)
    }
  }

  if (!modal) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10004,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '44rem',
          background: 'linear-gradient(160deg, rgba(18,14,30,0.98) 0%, rgba(12,10,20,0.98) 100%)',
          border: '1px solid rgba(141,94,244,0.25)',
          borderRadius: '2.4rem',
          padding: '4rem 4rem 3.6rem',
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(141,94,244,0.08), 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(141,94,244,0.12)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Purple corner glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(141,94,244,0.6) 50%, transparent 100%)',
          borderRadius: '2.4rem 2.4rem 0 0',
        }} />
        <div style={{
          position: 'absolute',
          top: '-6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24rem',
          height: '12rem',
          background: 'radial-gradient(ellipse, rgba(141,94,244,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Close button */}
        <button
          onClick={close}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            width: '3.6rem',
            height: '3.6rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1.8rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(141,94,244,0.2)'
            e.currentTarget.style.borderColor = 'rgba(141,94,244,0.5)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          }}
        >
          ×
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.8rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="CyberT"
            style={{ height: '3rem', filter: 'drop-shadow(0 0 12px rgba(141,94,244,0.6))' }}
          />
        </div>

        {modal === 'signin' && (
          <ModalSignIn
            error={error}
            success={success}
            loading={loading}
            onSubmit={handleSignIn}
            onRecover={() => { setModal('recover'); setError(''); setSuccess('') }}
            onSignUp={openSignUp}
          />
        )}

        {modal === 'signup' && (
          <ModalSignUp
            error={error}
            loading={loading}
            onSubmit={handleSignUp}
            onSignIn={openSignIn}
          />
        )}

        {modal === 'recover' && (
          <ModalRecover
            error={error}
            success={success}
            loading={loading}
            onSubmit={handleRecover}
            onSignIn={openSignIn}
          />
        )}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px rgb(28, 20, 50) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          border-color: rgba(255,255,255,0.12) !important;
        }
      `}</style>
    </div>
  )
}

/* ── Sub-forms ── */

function ModalSignIn({ error, success, loading, onSubmit, onRecover, onSignUp }: {
  error: string; success: string; loading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onRecover: () => void; onSignUp: () => void
}) {
  return (
    <>
      <ModalTitle>Вход в аккаунт</ModalTitle>
      <ModalSub>Добро пожаловать обратно</ModalSub>
      {success && <StatusBanner type="success">{success}</StatusBanner>}
      {error   && <StatusBanner type="error">{error}</StatusBanner>}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '2.8rem' }}>
        <AuthInput name="email" type="email" placeholder="Email" required icon="email" />
        <AuthInput name="password" type="password" placeholder="Пароль" required icon="lock" />
        <SubmitButton loading={loading}>{loading ? 'Вход...' : 'Войти'}</SubmitButton>
      </form>
      <div style={{ marginTop: '2.4rem', display: 'flex', justifyContent: 'center', gap: '2.4rem' }}>
        <LinkBtn onClick={onRecover}>Забыли пароль?</LinkBtn>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <LinkBtn onClick={onSignUp}>Регистрация</LinkBtn>
      </div>
    </>
  )
}

function ModalSignUp({ error, loading, onSubmit, onSignIn }: {
  error: string; loading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onSignIn: () => void
}) {
  return (
    <>
      <ModalTitle>Создать аккаунт</ModalTitle>
      <ModalSub>Присоединяйся к CyberT</ModalSub>
      {error && <StatusBanner type="error">{error}</StatusBanner>}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '2.8rem' }}>
        <AuthInput name="email" type="email" placeholder="Email" required icon="email" />
        <AuthInput name="phone_number" type="tel" placeholder="+7XXXXXXXXXX" required icon="phone" />
        <AuthInput name="password" type="password" placeholder="Пароль" required icon="lock" />
        <AuthInput name="re_password" type="password" placeholder="Повторите пароль" required icon="lock" />
        <SubmitButton loading={loading}>{loading ? 'Создание...' : 'Создать аккаунт'}</SubmitButton>
      </form>
      <div style={{ marginTop: '2.4rem', display: 'flex', justifyContent: 'center' }}>
        <LinkBtn onClick={onSignIn}>Уже есть аккаунт? Войти</LinkBtn>
      </div>
    </>
  )
}

function ModalRecover({ error, success, loading, onSubmit, onSignIn }: {
  error: string; success: string; loading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onSignIn: () => void
}) {
  return (
    <>
      <ModalTitle>Восстановление</ModalTitle>
      <ModalSub>Введите email для сброса пароля</ModalSub>
      {success && <StatusBanner type="success">{success}</StatusBanner>}
      {error   && <StatusBanner type="error">{error}</StatusBanner>}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '2.8rem' }}>
        <AuthInput name="email" type="email" placeholder="Email" required icon="email" />
        <SubmitButton loading={loading}>{loading ? 'Отправка...' : 'Отправить письмо'}</SubmitButton>
      </form>
      <div style={{ marginTop: '2.4rem', display: 'flex', justifyContent: 'center' }}>
        <LinkBtn onClick={onSignIn}>← Назад ко входу</LinkBtn>
      </div>
    </>
  )
}

/* ── Shared primitives ── */

function ModalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Colus', 'Gotham Pro', sans-serif",
      fontSize: '2.6rem',
      fontWeight: 400,
      textAlign: 'center',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #C9AAFF 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      lineHeight: 1.2,
    }}>
      {children}
    </h2>
  )
}

function ModalSub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      textAlign: 'center',
      fontSize: '1.4rem',
      color: 'rgba(255,255,255,0.35)',
      fontFamily: "'Bahnschrift', sans-serif",
      marginTop: '0.6rem',
      marginBottom: 0,
    }}>
      {children}
    </p>
  )
}

function StatusBanner({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const isErr = type === 'error'
  return (
    <div style={{
      marginTop: '1.8rem',
      padding: '1.2rem 1.6rem',
      borderRadius: '1rem',
      background: isErr ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      borderLeft: `3px solid ${isErr ? '#EF4444' : '#22C55E'}`,
      fontSize: '1.35rem',
      color: isErr ? '#FCA5A5' : '#86EFAC',
      fontFamily: "'Bahnschrift', sans-serif",
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  )
}

const INPUT_ICONS: Record<string, React.ReactNode> = {
  email: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 5.5L8 9.5L15 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h3l1.5 3.5-1.75 1.25a8.5 8.5 0 0 0 3.5 3.5L10.5 8.5 14 10v3a1 1 0 0 1-1 1C5.163 14 2 7.163 2 3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

function AuthInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) {
  const [focused, setFocused] = useState(false)
  const svgIcon = icon ? INPUT_ICONS[icon] : null
  return (
    <div style={{ position: 'relative' }}>
      {svgIcon && (
        <span style={{
          position: 'absolute',
          left: '1.6rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          color: focused ? '#B999FD' : 'rgba(141,94,244,0.65)',
          transition: 'color 0.2s',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          {svgIcon}
        </span>
      )}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: svgIcon ? '1.4rem 1.6rem 1.4rem 4.4rem' : '1.4rem 1.6rem',
          borderRadius: '1.2rem',
          background: focused ? 'rgba(141,94,244,0.15)' : 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${focused ? 'rgba(141,94,244,0.6)' : 'rgba(255,255,255,0.12)'}`,
          color: '#fff',
          fontSize: '1.5rem',
          fontFamily: "'Bahnschrift', sans-serif",
          outline: 'none',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(141,94,244,0.12)' : 'none',
        }}
      />
    </div>
  )
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        marginTop: '0.6rem',
        padding: '1.5rem',
        borderRadius: '1.2rem',
        background: loading
          ? 'rgba(141,94,244,0.4)'
          : 'linear-gradient(135deg, #8D5EF4 0%, #B999FD 100%)',
        border: 'none',
        color: '#fff',
        fontSize: '1.6rem',
        fontWeight: 700,
        fontFamily: "'Colus', 'Gotham Pro', sans-serif",
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 4px 28px rgba(141,94,244,0.5)',
        transition: 'all 0.25s',
        letterSpacing: '0.03em',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 36px rgba(141,94,244,0.65)'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 28px rgba(141,94,244,0.5)'
        }
      }}
    >
      {children}
    </button>
  )
}

function LinkBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.35rem',
        color: 'rgba(185,153,253,0.7)',
        fontFamily: "'Bahnschrift', sans-serif",
        transition: 'color 0.2s',
        padding: 0,
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#B999FD' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(185,153,253,0.7)' }}
    >
      {children}
    </button>
  )
}
