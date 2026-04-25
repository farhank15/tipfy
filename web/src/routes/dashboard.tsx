import { defer, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '../store/auth'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { X } from 'lucide-react'

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
  loader: async () => {
    try {
      const wallet = await getPayoutSettingsServerFn()
      const statsPromise = getDashboardStatsServerFn()
      const donationsPromise = getDonationsServerFn()
      
      return { 
        wallet, 
        deferredStats: defer(statsPromise),
        deferredDonations: defer(donationsPromise)
      }
    } catch (e) {
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
  const [showQRModal, setShowQRModal] = useState(false)
  
  useEffect(() => {
    if (!user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  if (!user || !loaderData) return null

  const { wallet } = loaderData
  const walletIsActive = wallet?.isActive || false

  const setActiveTab = (id: string) => {
    const tabMap: Record<string, any> = {
      'OVERVIEW': 'OVERVIEW',
      'TRANSACTIONS': 'TRANSACTIONS',
      'OVERLAYS': 'OVERLAYS',
      'SETTINGS': 'SETTINGS'
    }
    navigate({ search: (prev: any) => ({ ...prev, tab: tabMap[id] || 'OVERVIEW', widget: undefined }) })
  }

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/u/${user?.username || user?.address}`
    : ''

  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&color=000&bgcolor=fff`

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      {/* QR MODAL - Top Level for maximum z-index visibility */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-12 max-w-sm w-full space-y-6 flex flex-col items-center skew-x--2 border-[12px] border-neon-cyan/20 shadow-[0_0_50px_rgba(0,255,242,0.2)]"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute -top-12 -right-12 p-4 text-white hover:text-neon-cyan transition-colors"
              >
                <X size={32} />
              </button>
              
              <div className="absolute -top-8 left-0 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                <span className="text-neon-cyan text-[10px] font-black uppercase tracking-[0.5em] glow-cyan">Transmission_ID_Active</span>
              </div>

              <div className="w-64 h-64">
                <img src={QR_CODE_URL} alt="Enlarged QR" className="w-full h-full" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-black font-black uppercase tracking-widest text-[10px]">Transmission_Link</p>
                <p className="text-black font-mono text-[10px] break-all opacity-50">{profileUrl}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl)
                  alert('Transmission link copied to grid!')
                }}
                className="w-full py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-colors"
              >
                Copy_Link
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative">
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          showQRModal={showQRModal}
          setShowQRModal={setShowQRModal}
        />

        <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 space-y-12 overflow-hidden relative z-10">
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
                  onClick={() => setActiveTab('SETTINGS')}
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
