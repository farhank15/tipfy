import { defer, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import { useEffect } from 'react'
import { z } from 'zod'

import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { CommandCenter } from '../components/dashboard/CommandCenter'
import { TransmissionLog } from '../components/dashboard/TransmissionLog'
import { SystemBridge } from '../components/dashboard/system-bridge'
import { PayoutView as WalletSettingsView } from '../components/dashboard/PayoutView'
import { getPayoutSettingsServerFn } from '../lib/payout-utils'
import { getDashboardStatsServerFn, getDonationsServerFn } from '../lib/overlay-utils'

const dashboardSearchSchema = z.object({
  tab: z.enum(['OVERVIEW', 'TRANSACTIONS', 'OVERLAYS', 'SETTINGS']).catch('OVERVIEW'),
  widget: z.string().optional(),
})

export const Route = createFileRoute('/dashboard')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  // Untuk sementara, biarkan client-side auth menangani ini agar tidak dilempar ke root
  // karena server belum memiliki cookie session
  loader: async () => {
    try {
      // Wallet settings are critical for the initial shell
      const wallet = await getPayoutSettingsServerFn()
      
      // Stats and donations can be streamed
      const statsPromise = getDashboardStatsServerFn()
      const donationsPromise = getDonationsServerFn()
      
      return { 
        wallet, 
        deferredStats: defer(statsPromise),
        deferredDonations: defer(donationsPromise)
      }
    } catch (e) {
      // Fallback data if server fns fail due to auth
      return {
        wallet: { isActive: false, payoutAddress: '', isStakingEnabled: false },
        deferredStats: defer(Promise.resolve({})),
        deferredDonations: defer(Promise.resolve([]))
      }
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate({ from: Route.fullPath })
  const loaderData = Route.useLoaderData()
  const { tab: activeTab } = Route.useSearch()
  
  // Guard client-side
  useEffect(() => {
    if (!user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  if (!user || !loaderData) return null

  const { wallet, deferredStats, deferredDonations } = loaderData
  const walletIsActive = wallet?.isActive || false

  const setActiveTab = (id: string) => {
    // Map sidebar IDs to search param tabs
    const tabMap: Record<string, any> = {
      'OVERVIEW': 'OVERVIEW',
      'TRANSACTIONS': 'TRANSACTIONS',
      'OVERLAYS': 'OVERLAYS',
      'SETTINGS': 'SETTINGS'
    }
    navigate({ search: (prev: any) => ({ ...prev, tab: tabMap[id] || 'OVERVIEW', widget: undefined }) })
  }

  // Convert search param tab back to sidebar active ID
  const getActiveId = (tab: string) => {
    return tab // IDs are now identical to tabs
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative">
        <DashboardSidebar 
          activeTab={getActiveId(activeTab)} 
          setActiveTab={setActiveTab} 
        />

        <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 space-y-12 overflow-hidden">
          {!walletIsActive && activeTab === 'OVERVIEW' && (
            <section className="bg-neon-pink/10 border border-neon-pink/30 p-4 skew-x--5 mb-8">
              <div className="skew-x-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">
                    Protocol Incomplete. Masukkan wallet tujuan untuk mengaktifkan fitur donasi on-chain.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('PAYOUTS')}
                  className="px-4 py-1.5 bg-neon-pink text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Set Wallet
                </button>
              </div>
            </section>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'OVERVIEW' && (
              <CommandCenter 
                key="overview" 
              />
            )}
            {activeTab === 'TRANSACTIONS' && <TransmissionLog key="txs" />}
            {activeTab === 'OVERLAYS' && <SystemBridge user={user} key="overlays" />}
            {activeTab === 'SETTINGS' && (
              <WalletSettingsView 
                key="settings" 
                initialAddress={wallet?.payoutAddress || ''} 
                initialStaking={(wallet as any)?.isStakingEnabled || false} 
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      <Footer />
    </div>
  )
}
