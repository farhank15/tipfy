import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  address: string
  username?: string | null
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isPending: false,
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
    }),
    {
      name: 'tipfy-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
