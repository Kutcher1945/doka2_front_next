export interface User {
  id: number
  email: string
  username: string
  phone_number: string
  steam_id: string | null
  dota_mmr: number
  dota_rank: number
  service_rating: number
  is_blocked: boolean
  online_status: string
  auth_token?: string
}

export interface UserWallet {
  id: number
  balance: number
  bonus_balance: number
  blocked_balance: number
  payout_commission: number
  currency: 'USD' | 'UAH' | 'RUB' | 'KZT' | 'UZS'
  language_payments: 'en' | 'ua' | 'ru' | 'kk' | 'uz'
}

export type LobbyStatus = 'Created' | 'Pending' | 'Game started' | 'Finished' | 'Error'
export type GameMode = 'All Pick' | '1v1 Solo Mid' | 'Captains Mode'
export type LobbySlots = 2 | 10

export interface Lobby {
  id: number
  name: string
  password: string | null
  bet: number
  slots: LobbySlots
  game_mode: GameMode
  status: LobbyStatus
  position: number | null
  task_id: string | null
  match_id: string | null
  datetime_create: string
  datetime_start_game: string | null
  datetime_finish_game: string | null
  vs_bots: boolean
  dota_lobby_id: number | null
}

export interface Membership {
  id: number
  user_id: number
  lobby_id: number
  team: '1' | '2'
  position: number | null
  status: boolean
  leader: boolean
}

export interface PlayerInfo {
  id: number
  user_id: number
  steam_id: string
  hero_id: number
  team: '1' | '2'
  game_team: string
  game_name: string
  game_commission: number
}

export interface GameHistory {
  id: number
  lobby_link: number
  start_game: string
  finish_game: string
  result: string | null
  players_info: PlayerInfo[]
}

export interface Friendship {
  id: number
  status: 'requested' | 'accepted' | 'declined'
  requested_user: User
  addressee_user: User
  datetime_create: string
  datetime_approve: string | null
}

export interface WalletHistory {
  payment_id: string
  pay_time: string
  status: string | null
  amount: number | null
  currency: string | null
  method: string | null
  type: string | null
  payout_commission: number
}

export interface SiteStatus {
  is_enabled: boolean
}

// WebSocket message shapes
export interface LobbySocketMessage {
  data: {
    command?: string
    success?: boolean
    error?: string
    full?: boolean
    status?: boolean
    start_game?: boolean
    userID?: number
    lobbyID?: number
    team?: '1' | '2'
    userPosition?: number
  }
}
