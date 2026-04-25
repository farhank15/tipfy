import { useEffect, useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/auth'
import { createServerFn } from '@tanstack/react-start'

// Server Functions for Auth
const getNonceFn = createServerFn({ method: 'GET' }).handler(async () => {
  return { nonce: `tipfy-${Math.random().toString(36).substring(2)}` }
})

const loginFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: any) => {
    const data = ctx.data
    return { 
      user: { 
        address: data.address, 
        username: null 
      } 
    }
  })

function WalletAuthInner({ 
  useAccount, 
  useSignMessage, 
  ConnectKitButton 
}: any) {
  const { isConnected, address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const navigate = useNavigate()
  const isVerifying = useRef(false)
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    const verify = async () => {
      if (isConnected && address && !user && !isVerifying.current) {
        isVerifying.current = true
        try {
          const { nonce } = await getNonceFn()
          const message = `Sign this message to authenticate with Tipfy: ${nonce}`
          const signature = await signMessageAsync({ message })

          // Kirim data sebagai objek yang dibungkus properti 'data'
          const res = await loginFn({ 
            data: { 
              address: address as string, 
              signature, 
              nonce 
            } 
          })

          setUser(res.user)
          if (!res.user.username) {
            navigate({ to: '/setup' })
          }
        } catch (err) {
          console.error('Auth failed:', err)
        } finally {
          isVerifying.current = false
        }
      }
    }
    verify()
  }, [isConnected, address, signMessageAsync, navigate, user, setUser])

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }: any) => (
        <button
          onClick={show}
          className="group relative px-6 py-2 bg-transparent overflow-hidden"
        >
          <div className="absolute inset-0 border border-neon-cyan/50 group-hover:border-neon-cyan transition-colors" />
          <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-cyan animate-pulse' : 'bg-zinc-800'}`} />
            <span className="text-sm font-black uppercase tracking-widest text-neon-cyan group-hover:text-white transition-colors">
              {isConnected ? (ensName ?? truncatedAddress) : 'Authorize_Wallet'}
            </span>
          </div>

          <div className="absolute -bottom-px left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      )}
    </ConnectKitButton.Custom>
  )
}

export function WalletAuth() {
  const [mounted, setMounted] = useState(false)
  const [Web3Lib, setWeb3Lib] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [wagmi, connectkit] = await Promise.all([
          import('wagmi'),
          import('connectkit')
        ])
        setWeb3Lib({ 
          useAccount: wagmi.useAccount, 
          useSignMessage: wagmi.useSignMessage, 
          ConnectKitButton: connectkit.ConnectKitButton 
        })
        setMounted(true)
      } catch (e) {
        console.error('Load failed', e)
      }
    }
    load()
  }, [])

  if (!mounted || !Web3Lib) {
    return (
      <button className="px-6 py-2 border border-zinc-800 opacity-50 cursor-not-allowed">
        <span className="text-sm font-black text-zinc-500 uppercase tracking-widest animate-pulse">
          Syncing_Nodes...
        </span>
      </button>
    )
  }

  return <WalletAuthInner {...Web3Lib} />
}
