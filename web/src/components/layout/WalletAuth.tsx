import { ConnectKitButton } from 'connectkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { useNavigate } from '@tanstack/react-router'
import { checkProfileServerFn } from '../../lib/auth-utils'

export const WalletAuth = () => {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { user, setUser, setVerifying, logout, isPending, setPending } = useAuthStore()
  const navigate = useNavigate()
  const isVerifying = useRef(false)
  const hasCheckedSession = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isConnected || isVerifying.current) return

    const initAuth = async () => {
      if (hasCheckedSession.current) return
      hasCheckedSession.current = true

      try {
        const { isAuthenticated, walletAddress, slug } = await checkProfileServerFn()
        if (isAuthenticated && walletAddress) {
          setUser({ address: walletAddress, slug })
          setPending(false)
          return
        }
      } catch (e) {
        console.error('Session check failed')
      } finally {
        setPending(false)
      }
    }

    initAuth()
  }, [mounted, isConnected, setUser, setPending])

  useEffect(() => {
    if (mounted && !isConnected && user) {
      logout().then(() => navigate({ to: '/' }))
      return
    }

    const verify = async () => {
      if (!mounted || !isConnected || !address || user || isVerifying.current || isPending) return
      
      isVerifying.current = true
      setVerifying(true)
      
      try {
        const nonceRes = await fetch('/api/auth/nonce')
        const { nonce } = await nonceRes.json()
        
        const message = `Tipfy Authentication\nNonce: ${nonce}\nWallet: ${address}`
        const signature = await signMessageAsync({ message })
        
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature, address }),
        })

        if (verifyRes.ok) {
          const { hasProfile, slug } = await checkProfileServerFn()
          setUser({ address, slug })
          
          if (!hasProfile) {
            navigate({ to: '/setup' })
          } else {
            navigate({ to: '/dashboard', search: { tab: 'OVERVIEW' } })
          }
        }
      } catch (err) {
        console.error('Verification failed:', err)
        setUser(null)
      } finally {
        isVerifying.current = false
        setVerifying(false)
      }
    }

    verify()
  }, [mounted, isConnected, address, user, isPending, setUser, setVerifying, logout, signMessageAsync, navigate])

  if (!mounted) return null

  return (
    <div className="connect-kit-solid">
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName }) => {
          return (
            <button
              onClick={show}
              className={`
                px-6 py-2.5 font-black uppercase tracking-[0.2em] transition-all skew-x--10
                ${isConnected 
                  ? 'border border-white/10 hover:border-neon-pink/50 text-white bg-white/5' 
                  : 'bg-neon-pink text-black glow-pink hover:scale-[1.05]'
                }
              `}
            >
              <span className="skew-x-10 block italic">
                {isConnected ? (ensName ?? truncatedAddress) : 'Authorize_Wallet'}
              </span>
            </button>
          )
        }}
      </ConnectKitButton.Custom>

      <style>{`
        div[class^="ck-"] {
          --ck-body-background: #0a0a0a !important;
          --ck-body-background-secondary: #111111 !important;
          --ck-body-background-tertiary: #151515 !important;
          --ck-dropdown-background: #0a0a0a !important;
          --ck-modal-background: #0a0a0a !important;
          backdrop-filter: none !important;
        }
      `}</style>
    </div>
  )
}
