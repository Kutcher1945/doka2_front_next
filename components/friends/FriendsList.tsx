'use client'

import { useState } from 'react'
import { communityApi } from '@/lib/api'

interface FriendUser {
  id: number
  username: string
  status: string  // online status: "Online" | "Offline"
}

interface FriendsListProps {
  friends: FriendUser[]
  pendingRequests: FriendUser[]
}

export function FriendsList({ friends: initialFriends, pendingRequests: initialPending }: FriendsListProps) {
  const [friends] = useState<FriendUser[]>(initialFriends)
  const [pending, setPending] = useState<FriendUser[]>(initialPending)
  const [searchEmail, setSearchEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendRequest() {
    setError('')
    if (!searchEmail.trim()) return
    setLoading(true)
    try {
      setError('Функция поиска по email в разработке')
    } catch {
      setError('Ошибка при отправке заявки')
    } finally {
      setLoading(false)
    }
  }

  async function respond(userId: number, action: 'accepted' | 'declined') {
    try {
      await communityApi.respond(userId, action)
      setPending((prev) => prev.filter((u) => u.id !== userId))
    } catch { /* ignore */ }
  }

  return (
    <div style={{ padding: '2rem 2.4rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      <style>{`
        .fr-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.9rem; padding: 1.1rem 1.6rem; font-size: 1.4rem; color: #fff; font-family: 'Gotham Pro', sans-serif; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box; }
        .fr-input::placeholder { color: rgba(255,255,255,0.2); }
        .fr-input:focus { border-color: rgba(141,94,244,0.5); }
      `}</style>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#fff', fontFamily: "'Colus', 'Gotham Pro', sans-serif", margin: 0, lineHeight: 1.2 }}>
          Друзья
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif", margin: '0.4rem 0 0' }}>
          {friends.length > 0 ? `${friends.length} друзей` : 'Добавляйте игроков в друзья'}
        </p>
      </div>

      {/* Add friend */}
      <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.4rem', padding: '2.4rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif", marginBottom: '1.4rem' }}>
          Добавить друга
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              className="fr-input"
              style={{ paddingLeft: '3.8rem' }}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              placeholder="Email пользователя"
            />
          </div>
          <button
            onClick={sendRequest}
            disabled={loading}
            style={{
              padding: '1.1rem 2.4rem', borderRadius: '0.9rem',
              background: 'linear-gradient(135deg, #8D5EF4 0%, #6B3FD4 100%)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              color: '#fff', fontSize: '1.4rem', fontWeight: 700,
              fontFamily: "'Gotham Pro', sans-serif",
              opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
          >
            Добавить
          </button>
        </div>
        {error && (
          <div style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#ef4444', fontFamily: "'Gotham Pro', sans-serif" }}>
            {error}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {pending.length > 0 && (
        <Section title={`Входящие заявки (${pending.length})`} accent="#f59e0b">
          {pending.map((u) => (
            <FriendRow key={u.id} username={u.username}>
              <button
                onClick={() => respond(u.id, 'accepted')}
                style={{ padding: '0.5rem 1.2rem', borderRadius: '0.6rem', fontSize: '1.2rem', fontWeight: 600, fontFamily: "'Gotham Pro', sans-serif", background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', cursor: 'pointer' }}
              >
                Принять
              </button>
              <button
                onClick={() => respond(u.id, 'declined')}
                style={{ padding: '0.5rem 1.2rem', borderRadius: '0.6rem', fontSize: '1.2rem', fontWeight: 600, fontFamily: "'Gotham Pro', sans-serif", background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}
              >
                Отклонить
              </button>
            </FriendRow>
          ))}
        </Section>
      )}

      {/* Friends list */}
      <Section title={`Друзья (${friends.length})`} accent="#C9AAFF">
        {friends.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '12rem', gap: '1.2rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.18)', fontFamily: "'Gotham Pro', sans-serif" }}>
              Нет друзей — добавьте первого!
            </span>
          </div>
        ) : (
          friends.map((u) => {
            const online = u.status?.toLowerCase() === 'online'
            return (
              <FriendRow key={u.id} username={u.username}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '0.7rem', height: '0.7rem', borderRadius: '50%', background: online ? '#22c55e' : 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize: '1.2rem', color: online ? '#22c55e' : 'rgba(255,255,255,0.25)', fontFamily: "'Gotham Pro', sans-serif" }}>
                    {online ? 'В сети' : 'Не в сети'}
                  </span>
                </div>
              </FriendRow>
            )
          })
        )}
      </Section>
    </div>
  )
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, #0f0e17 0%, #0c0b14 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1.4rem', overflow: 'hidden' }}>
      <div style={{ padding: '1.4rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '3px', height: '1.4rem', borderRadius: '2px', background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', fontFamily: "'Gotham Pro', sans-serif" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0.8rem 0' }}>{children}</div>
    </div>
  )
}

function FriendRow({ username, children }: { username: string; children?: React.ReactNode }) {
  const initials = username?.[0]?.toUpperCase() ?? '?'
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{
          width: '3.8rem', height: '3.8rem', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #8D5EF4, #B999FD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: '#fff',
          fontFamily: "'Gotham Pro', sans-serif",
          boxShadow: '0 0 12px rgba(141,94,244,0.25)',
        }}>
          {initials}
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', fontFamily: "'Gotham Pro', sans-serif" }}>
          {username}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>{children}</div>
    </div>
  )
}
