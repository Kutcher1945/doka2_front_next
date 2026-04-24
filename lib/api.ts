import axios from 'axios'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from session on every client-side request
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession()
    const token = (session as { auth_token?: string } | null)?.auth_token
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
  }
  return config
})

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/token/login/', { email, password }),
  logout: () => api.post('/token/logout/'),
  register: (data: { email: string; password: string; re_password: string; phone_number: string }) =>
    api.post('/auth/users/', data),
  getUser: () => api.get('/auth/data/'),
  updateUser: (data: Partial<{ username: string; steam_id: string; dota_mmr: number; connected_games: { id: string; name: string }[] }>, headers?: Record<string, string>) =>
    api.put('/auth/data/', data, { headers }),
  restorePassword: (email: string) =>
    api.post('/auth/restore_password/', { email }),
  restorePasswordSubmit: (token: string, password: string, password_copy: string) =>
    api.post('/auth/restore_password/submit/', { token, password, password_copy }),
  changePassword: (old_password: string, new_password: string, new_password_copy: string, headers?: Record<string, string>) =>
    api.post('/auth/change_password/', { old_password, new_password, new_password_copy }, { headers }),
  disconnectSteam: (headers?: Record<string, string>) =>
    api.post('/auth/steam/disconnect/', {}, { headers }),
}

// Dota / Lobby
export const lobbyApi = {
  list: (params?: { amount?: number; offset?: number; lobby_bet_min?: number; lobby_bet_max?: number; lobby_name?: string }) =>
    api.get('/dota/lobby/', { params }),
  get: (id: number) => api.get(`/dota/lobby/${id}/`),
  create: (data: { name: string; bet: number; slots: number; game_mode: string; leader: number; password?: string }) =>
    api.post('/dota/lobby/', data),
  update: (id: number, data: object) => api.patch(`/dota/lobby/${id}/`, data),
  memberships: (id: number) => api.get(`/dota/lobby/${id}/memberships/`),
  similar: (bet: number, id: number) => api.get('/dota/lobby/similar/', { params: { bet, id } }),
  currentLobby: () => api.get('/dota/lobby/current/'),
  gameHistory: (lobbyId: number) => api.get(`/dota/game_history/${lobbyId}/by_lobby/`),
  userGameHistory: () => api.get('/dota/game_history/'),
  commission: () => api.get('/dota/game_history/commission/'),
  report: (data: { user_id: number; user_reported_id: number; lobby_id: number; datetime_create_game_time: string }) =>
    api.post('/dota/report/report_new_player/', data),
}

// Wallet / Payments
export const walletApi = {
  get: () => api.get('/monetix/wallet/'),
  replenish: (params: { payment_amount: number; payment_method: string; binance_id?: string; customer_id?: string | number }) =>
    api.get('/monetix/payments_handler/', { params }),
}

// Community (Friends)
export const communityApi = {
  friends: () => api.get('/community/friends/list/'),
  receivedRequests: () => api.get('/community/friends/received_requests/'),
  findUser: (user_id: number) => api.get('/community/friends/find/', { params: { user_id } }),
  sendRequest: (user_id: number) => api.post('/community/friends/request/', { user_id }),
  acceptRequest: (user_id: number) => api.post('/community/friends/accept/', { user_id }),
  rejectRequest: (user_id: number) => api.post('/community/friends/reject/', { user_id }),
  removeFriend: (user_id: number) => api.post('/community/friends/remove/', { user_id }),
  respond: (user_id: number, action: 'accepted' | 'declined') =>
    action === 'accepted'
      ? api.post('/community/friends/accept/', { user_id })
      : api.post('/community/friends/reject/', { user_id }),
}

// Site status
export const siteApi = {
  status: () => api.get('/site-status/'),
}
