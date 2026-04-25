import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logoutServerFn } from '../lib/auth-utils'

interface AuthUser {
  address: string
  username: string | null
}

interface AuthState {
  user: AuthUser | null
  isPending: boolean
  isVerifying: boolean
  setUser: (user: AuthUser | null) => void
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
          await logoutServerFn()
          set({ user: null })
          localStorage.removeItem('tipfy-auth-storage')
        } catch (err) {
          console.error('[AuthStore] Logout failed:', err)
          set({ user: null })
        }
      },
    }),
    {
      name: 'tipfy-auth-storage',
    }
  )
)
