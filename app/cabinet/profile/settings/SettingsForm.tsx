'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import type { User } from '@/types'

export default function SettingsForm({ steamId }: { steamId: string | null }) {
  const { data: session, update: updateSession } = useSession()
  const user = session?.user as unknown as User
  const authToken = (session as { auth_token?: string } | null)?.auth_token ?? ''
  const authHeaders: Record<string, string> = authToken ? { Authorization: `Token ${authToken}` } : {}
  const router = useRouter()

  const [username, setUsername] = useState(user?.username ?? '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordCopy, setNewPasswordCopy] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const [disconnectingSteam, setDisconnectingSteam] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showNewCopy, setShowNewCopy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentSteamId, setCurrentSteamId] = useState(steamId)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      await authApi.updateUser({ username }, authHeaders)
      setMsg({ type: 'success', text: 'Профиль обновлён' })
    } catch {
      setMsg({ type: 'error', text: 'Ошибка при сохранении' })
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== newPasswordCopy) {
      setMsg({ type: 'error', text: 'Пароли не совпадают' }); return
    }
    setChangingPwd(true); setMsg(null)
    try {
      await authApi.changePassword(oldPassword, newPassword, newPasswordCopy, authHeaders)
      setMsg({ type: 'success', text: 'Пароль успешно изменён' })
      setOldPassword(''); setNewPassword(''); setNewPasswordCopy('')
    } catch {
      setMsg({ type: 'error', text: 'Неверный старый пароль' })
    } finally {
      setChangingPwd(false)
    }
  }

  async function disconnectSteam() {
    if (!confirm('Отвязать Steam аккаунт?')) return
    setDisconnectingSteam(true); setMsg(null)
    try {
      await authApi.disconnectSteam(authHeaders)
      setCurrentSteamId(null)
      await updateSession()
      setMsg({ type: 'success', text: 'Steam успешно отвязан' })
    } catch {
      setMsg({ type: 'error', text: 'Ошибка при отвязке Steam' })
    } finally {
      setDisconnectingSteam(false)
    }
  }

  return (
    <div style={{ padding: '2.4rem 3.2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '72rem', margin: '0 auto' }}>

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
            Настройки
          </h1>
          <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.35)', margin: '0.3rem 0 0' }}>
            Управление аккаунтом
          </p>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{
          padding: '1.4rem 1.8rem', borderRadius: '1.2rem', fontSize: '1.4rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: msg.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          color: msg.type === 'success' ? '#4ade80' : '#f87171',
        }}>
          {msg.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {msg.text}
        </div>
      )}

      {/* Personal info */}
      <Section
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        title="Личные данные"
        desc="Имя пользователя и контактная информация"
      >
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <FieldGroup>
            <FieldLabel>Никнейм</FieldLabel>
            <StyledInput value={username} onChange={e => setUsername(e.target.value)} placeholder="Ваш никнейм" />
          </FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
            <FieldGroup>
              <FieldLabel>Email</FieldLabel>
              <StyledInput value={user?.email ?? ''} disabled />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Телефон</FieldLabel>
              <StyledInput value={user?.phone_number ?? ''} disabled />
            </FieldGroup>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '1.5rem', borderRadius: '1.2rem', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving ? 'rgba(141,94,244,0.4)' : 'linear-gradient(135deg, #8D5EF4 0%, #6040D4 100%)',
              border: 'none', color: '#fff', fontSize: '1.5rem', fontWeight: 700,
              fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {saving ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Сохранение...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Сохранить изменения
              </>
            )}
          </button>
        </form>
      </Section>

      {/* Change password */}
      <Section
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
        title="Безопасность"
        desc="Изменение пароля аккаунта"
      >
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <FieldGroup>
            <FieldLabel>Текущий пароль</FieldLabel>
            <PasswordInput value={oldPassword} onChange={e => setOldPassword(e.target.value)} show={showOld} onToggle={() => setShowOld(v => !v)} placeholder="Введите текущий пароль" />
          </FieldGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4rem' }}>
            <FieldGroup>
              <FieldLabel>Новый пароль</FieldLabel>
              <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Минимум 8 символов" />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Повторите пароль</FieldLabel>
              <PasswordInput value={newPasswordCopy} onChange={e => setNewPasswordCopy(e.target.value)} show={showNewCopy} onToggle={() => setShowNewCopy(v => !v)} placeholder="Повторите новый пароль" />
            </FieldGroup>
          </div>
          {newPassword && newPasswordCopy && newPassword !== newPasswordCopy && (
            <div style={{ fontSize: '1.2rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '-0.4rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Пароли не совпадают
            </div>
          )}
          <button
            type="submit"
            disabled={changingPwd}
            style={{
              padding: '1.5rem', borderRadius: '1.2rem', cursor: changingPwd ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: '1.5rem', fontWeight: 600,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!changingPwd) { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(141,94,244,0.08)' } }}
            onMouseLeave={e => { if (!changingPwd) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
          >
            {changingPwd ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Изменение...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Изменить пароль
              </>
            )}
          </button>
        </form>
      </Section>

      {/* Steam */}
      <Section
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
        title="Steam"
        desc="Привязка аккаунта для участия в матчах"
      >
        {currentSteamId ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.6rem 2rem', borderRadius: '1.2rem',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
              gap: '1.6rem', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ width: '3.6rem', height: '3.6rem', borderRadius: '0.8rem', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>Steam подключён</div>
                  <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem', fontFamily: 'monospace' }}>{currentSteamId}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.25)', padding: '0.4rem 1rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                MMR синхронизируется автоматически
              </div>
            </div>
            <button
              type="button"
              onClick={disconnectSteam}
              disabled={disconnectingSteam}
              style={{
                padding: '1.2rem 2rem', borderRadius: '1.2rem', cursor: disconnectingSteam ? 'not-allowed' : 'pointer',
                background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.25)',
                color: disconnectingSteam ? 'rgba(248,113,113,0.4)' : '#f87171',
                fontSize: '1.4rem', fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                transition: 'all 0.15s', alignSelf: 'flex-start',
              }}
              onMouseEnter={e => { if (!disconnectingSteam) { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' } }}
              onMouseLeave={e => { if (!disconnectingSteam) { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' } }}
            >
              {disconnectingSteam ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Отвязка...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Отвязать Steam
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div style={{
              padding: '1.6rem 2rem', borderRadius: '1.2rem',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', gap: '1.2rem',
            }}>
              <div style={{ width: '3.6rem', height: '3.6rem', borderRadius: '0.8rem', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>Steam не подключён</div>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>Требуется для участия в лобби. MMR будет получен из Dotabuff.</div>
              </div>
            </div>
            <a
              href={`/api/auth/steam?token=${authToken}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                padding: '1.5rem', borderRadius: '1.2rem', textDecoration: 'none',
                background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
                border: '1.5px solid rgba(141,94,244,0.4)',
                color: '#fff', fontSize: '1.5rem', fontWeight: 700,
                fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.7)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(141,94,244,0.25)' }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.4)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Подключить через Steam
            </a>
          </div>
        )}
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, #0f0e1a 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.6rem', overflow: 'hidden' }}>
      <div style={{ padding: '2rem 2.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
        <div style={{ width: '3.8rem', height: '3.8rem', borderRadius: '1rem', background: 'rgba(141,94,244,0.12)', border: '1px solid rgba(141,94,244,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b999fd', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", letterSpacing: '0.04em' }}>{title}</div>
          <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>{desc}</div>
        </div>
      </div>
      <div style={{ padding: '2.4rem' }}>
        {children}
      </div>
    </div>
  )
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>{children}</div>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{children}</div>
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '1.3rem 1.6rem',
        borderRadius: '1rem', fontSize: '1.4rem',
        background: props.disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
        border: '1.5px solid rgba(255,255,255,0.08)',
        color: props.disabled ? 'rgba(255,255,255,0.25)' : '#fff',
        outline: 'none', boxSizing: 'border-box' as const,
        fontFamily: 'inherit', transition: 'border-color 0.15s',
        cursor: props.disabled ? 'not-allowed' : 'text',
        ...props.style,
      }}
      onFocus={e => { if (!props.disabled) e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    />
  )
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '1.3rem 4.8rem 1.3rem 1.6rem',
          borderRadius: '1rem', fontSize: '1.4rem',
          background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
          color: '#fff', outline: 'none', boxSizing: 'border-box' as const,
          fontFamily: 'inherit', transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(141,94,244,0.6)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}
