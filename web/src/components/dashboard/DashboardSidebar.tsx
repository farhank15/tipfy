import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Zap, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  Menu,
  X,
  User,
  ArrowRightLeft
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/auth'

function SidebarInner({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  setIsMobileOpen, 
  user, 
  logout,
  Web3
}: any) {
  const { isConnected } = Web3.useAccount()
  const { data: balance } = Web3.useBalance({
    address: user?.address as `0x${string}`,
  })

  const menuItems = [
    { id: 'OVERVIEW', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'PROFILE', label: 'My Profile', icon: <User size={20} /> },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: <ArrowRightLeft size={20} /> },
    { id: 'OVERLAYS', label: 'Overlays', icon: <Zap size={20} /> },
    { id: 'SETTINGS', label: 'Settlement', icon: <ShieldCheck size={20} /> },
  ]

  const handleMenuClick = (item: any) => {
    if (item.id === 'PROFILE') {
      window.open(`/u/${user?.username || user?.address}`, '_blank')
      return
    }
    setActiveTab(item.id)
    setIsMobileOpen(false)
  }

  return (
    <div className="h-full flex flex-col bg-black border-r border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(0,255,242,0.03),transparent_50%)]" />
      
      <div className="p-6 mb-8 flex items-center justify-between relative z-10">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-2 hover:bg-white/5 text-neutral-500 hover:text-neon-cyan transition-all"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="px-3 flex-1 space-y-2 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={`
              w-full flex items-center gap-4 px-4 py-4 transition-all relative group
              ${activeTab === item.id 
                ? 'text-neon-cyan' 
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <div className={`${activeTab === item.id ? 'glow-cyan' : ''}`}>{item.icon}</div>
            {!isCollapsed && (
              <span className="text-xs font-black uppercase tracking-[0.2em] italic">
                {item.label}
              </span>
            )}
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-8 bg-neon-cyan shadow-[0_0_15px_rgba(0,255,242,0.5)]" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-white/5 relative z-10">
        <div className={`
          p-4 bg-white/2 border border-white/5 rounded-none skew-x--5 mb-4
          ${isCollapsed ? 'flex justify-center' : ''}
        `}>
          <div className="skew-x-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-neutral-500" />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest truncate text-white">@{user?.username || 'Anonymous'}</p>
                  <p className="text-[8px] font-mono text-neutral-600 truncate">{user?.address?.slice(0,6)}...{user?.address?.slice(-4)}</p>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wallet size={10} className="text-neon-pink" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Balance</span>
                  </div>
                  <span className="text-[10px] font-mono text-neon-pink">
                    {balance ? `${Number(Web3.formatEther(balance.value)).toFixed(2)} MON` : '0.00 MON'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className={`
            w-full flex items-center gap-4 px-4 py-4 text-neutral-600 hover:text-red-500 transition-all group
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest italic">Terminate_Session</span>}
        </button>
      </div>
    </div>
  )
}

export const DashboardSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const [Web3, setWeb3] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [wagmi, viem] = await Promise.all([
          import('wagmi'),
          import('viem')
        ])
        setWeb3({ 
          useBalance: wagmi.useBalance, 
          useAccount: wagmi.useAccount,
          formatEther: viem.formatEther 
        })
      } catch (e) {
        console.error('Sidebar Web3 Load failed', e)
      }
    }
    load()
  }, [])

  if (!Web3) {
    return (
      <div className="h-screen w-72 bg-black border-r border-white/5 flex items-center justify-center">
        <Zap size={24} className="text-zinc-800 animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 text-neon-cyan skew-x--10"
        >
          <Menu size={24} className="skew-x-10" />
        </button>
      </div>

      <div className={`hidden md:block h-screen sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <SidebarInner 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          user={user}
          logout={logout}
          Web3={Web3}
        />
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <SidebarInner 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={false}
              setIsCollapsed={() => {}}
              setIsMobileOpen={setIsMobileOpen}
              user={user}
              logout={logout}
              Web3={Web3}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
