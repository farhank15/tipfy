import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlitchText } from '../components/ui/GlitchText'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { Loader2, AtSign, CheckCircle2, AlertCircle } from 'lucide-react'
import { checkProfileServerFn } from '../lib/auth-utils'

export const Route = createFileRoute('/setup')({
  beforeLoad: async () => {
    const { isAuthenticated, hasProfile } = await checkProfileServerFn()
    
    if (!isAuthenticated) {
      throw redirect({ to: '/' })
    }

    if (hasProfile) {
      throw redirect({ to: '/dashboard', search: { tab: 'OVERVIEW' } })
    }
  },
  component: SetupPage,
})

function SetupPage() {
  const [username, setUsername] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckUsername = async (val: string) => {
    const cleanVal = val.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleanVal)
    setError(null)

    if (cleanVal.length < 3) {
      setIsAvailable(null)
      return
    }
    
    setIsChecking(true)
    try {
      const res = await fetch(`/api/auth/check-username?username=${cleanVal}`)
      const data = await res.json()
      setIsAvailable(data.available)
    } catch (err) {
      console.error('Check failed:', err)
    } finally {
      setIsChecking(false)
    }
  }

  const handleClaim = async () => {
    if (!isAvailable || !username) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/claim-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to claim username')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,242,0.05),transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <GlitchText text="INITIALIZE_IDENTITY" className="text-neon-cyan text-xs tracking-[0.4em] mb-2 uppercase" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Claim Your <span className="text-neon-pink">Slug</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-2 uppercase tracking-widest font-bold">
              Choose your unique tipfy identity.
            </p>
          </div>

          <div className="glass-card border border-white/10 p-8 space-y-6 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50" />
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <AtSign size={12} className="text-neon-cyan" /> Username_Slug
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => handleCheckUsername(e.target.value)}
                  placeholder="e.g. mawa_gaming"
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 text-xl font-mono text-white focus:border-neon-cyan outline-none transition-all uppercase placeholder:text-neutral-700 tracking-tighter"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isChecking ? (
                    <Loader2 size={20} className="animate-spin text-neutral-500" />
                  ) : isAvailable === true ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : isAvailable === false ? (
                    <AlertCircle size={20} className="text-neon-pink" />
                  ) : null}
                </div>
              </div>
              {error && (
                <p className="text-[10px] font-bold text-neon-pink uppercase animate-pulse italic">
                  Error: {error}
                </p>
              )}
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-tight">
                Your profile will be: <span className="text-neon-cyan italic">tipfy.me/u/{username || '...'}</span>
              </p>
            </div>

            <button
              onClick={handleClaim}
              disabled={!isAvailable || isLoading}
              className={`w-full py-4 font-black uppercase tracking-[0.2em] transition-all skew-x--10 flex items-center justify-center gap-2 ${
                isAvailable 
                ? 'bg-neon-cyan text-black glow-cyan hover:scale-[1.02]' 
                : 'bg-white/5 text-neutral-600 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span className="skew-x-10 flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'INITIALIZE_SYNC'}
              </span>
            </button>
          </div>

          <p className="text-center mt-6 text-[8px] font-mono text-neutral-700 uppercase tracking-[0.5em]">
            Protocol_v1.0.4 // Identity_Verified_On_Chain
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
