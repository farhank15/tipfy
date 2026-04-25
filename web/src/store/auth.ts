import { create } from 'zustand'

interface User {
  address: string
  slug?: string
}

interface AuthState {
  user: User | null
  isPending: boolean
  isVerifying: boolean
  setUser: (user: User | null) => void
  setPending: (isPending: boolean) => void
  setVerifying: (isVerifying: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isPending: true,
  isVerifying: false,
  setUser: (user) => set({ user }),
  setPending: (isPending) => set({ isPending }),
  setVerifying: (isVerifying) => set({ isVerifying }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      set({ user: null })
    } catch (err) {
      console.error('[AuthStore] Logout failed:', err)
    }
  },
}))
