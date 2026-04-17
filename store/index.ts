'use client'

import { create } from 'zustand'
import type { Lobby, UserWallet } from '@/types'

interface AppStore {
  currentLobby: Lobby | null
  wallet: UserWallet | null
  mobileMenuOpen: boolean
  setCurrentLobby: (lobby: Lobby | null) => void
  setWallet: (wallet: UserWallet | null) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useStore = create<AppStore>((set) => ({
  currentLobby: null,
  wallet: null,
  mobileMenuOpen: false,

  setCurrentLobby: (lobby) => set({ currentLobby: lobby }),

  setWallet: (wallet) => set({ wallet }),

  setMobileMenuOpen: (open) => {
    set({ mobileMenuOpen: open })
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('overflow-hidden', open)
    }
  },
}))
