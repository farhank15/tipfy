import { create } from 'zustand'

interface UIState {
  showProfile: boolean
  setShowProfile: (show: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  showProfile: false,
  setShowProfile: (showProfile) => set({ showProfile }),
}))
