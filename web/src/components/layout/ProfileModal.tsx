import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Shield, Wallet, Copy, ExternalLink, Loader2, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

function ProfileModalInner({ 
  user, 
  onClose, 
  Web3 
}: any) {
  const [copied, setCopied] = useState(false)
  const { data: balance } = Web3.useBalance({
    address: user?.address as `0x${string}`,
  })

  const handleCopy = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/10 relative overflow-hidden skew-x--2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-cyan animate-pulse" />
        
        <div className="p-8 skew-x-2">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-neon-cyan" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-cyan">Identity_Verified</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Profile_<span className="text-neon-cyan">Nexus</span></h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 text-neutral-500 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/5 border-2 border-neon-cyan/20 p-1 skew-x--10">
                <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <User size={40} className="text-neutral-700" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic text-white uppercase">@{user?.username || 'Anonymous'}</h3>
                <div className="flex items-center gap-2 text-neon-cyan/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active_Node</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/2 border border-white/5 space-y-3 skew-x--5">
                <div className="skew-x-5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-neon-pink" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Wallet_Address</span>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="text-[10px] font-black text-neon-cyan hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {copied ? 'Copied!' : <Copy size={14} />}
                  </button>
                </div>
                <div className="skew-x-5 font-mono text-xs text-white bg-black/40 p-3 border border-white/5 break-all">
                  {user?.address || '0x...'}
                </div>
              </div>

              <div className="p-4 bg-white/2 border border-white/5 space-y-3 skew-x--5">
                <div className="skew-x-5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Available_Balance</span>
                  </div>
                  <span className="text-[10px] font-black text-neon-pink uppercase tracking-widest animate-pulse">Live_Sync</span>
                </div>
                <div className="skew-x-5 flex items-end gap-2">
                  <span className="text-3xl font-black italic text-white leading-none">
                    {balance ? Number(Web3.formatEther(balance.value)).toFixed(4) : '0.0000'}
                  </span>
                  <span className="text-xs font-black text-neutral-600 uppercase mb-1">MON</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href={`https://testnet.monadexplorer.com/address/${user?.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white/5 hover:bg-neon-cyan/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 skew-x--10"
              >
                <span className="skew-x-10 flex items-center gap-2">
                  <ExternalLink size={14} /> View_on_Explorer
                </span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export const ProfileModal = ({ 
  isOpen, 
  onClose, 
  user 
}: { 
  isOpen: boolean
  onClose: () => void
  user: any 
}) => {
  const [Web3, setWeb3] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        try {
          const [wagmi, viem] = await Promise.all([
            import('wagmi'),
            import('viem')
          ])
          setWeb3({
            useBalance: wagmi.useBalance,
            formatEther: viem.formatEther
          })
        } catch (e) {
          console.error('ProfileModal Web3 Load failed', e)
        }
      }
      load()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {!Web3 ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
           <Loader2 size={40} className="text-neon-cyan animate-spin" />
        </div>
      ) : (
        <ProfileModalInner 
          user={user} 
          onClose={onClose} 
          Web3={Web3} 
        />
      )}
    </AnimatePresence>
  )
}
