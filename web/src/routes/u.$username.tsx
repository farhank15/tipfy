import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { GlitchText } from '../components/ui/GlitchText'
import { getPublicProfileServerFn } from '../lib/auth-utils'
import { recordDonationServerFn } from '../lib/overlay-utils'
import { TipFyVaultABI } from '../lib/TipFyVaultABI'

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000'

function ProfilePageInner({ 
  user, 
  Web3Lib
}: any) {
  const [amount, setAmount] = useState('0.1')
  const [message, setMessage] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, parseEther } = Web3Lib
  const { isConnected, address: senderAddress } = useAccount()
  const [isCustom, setIsPaused] = useState(false) // Reusing as toggle custom
  const [customAmount, setCustomAmount] = useState('')

  const { ConnectKitButton } = Web3Lib
  
  // ... rest of logic
  const { sendTransactionAsync } = useSendTransaction()
  // Hook for vault donation
  const { writeContractAsync } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // Effect to record donation after confirmation
  useEffect(() => {
    if (isSuccess && txHash && isDonating) {
      const record = async () => {
        try {
          await recordDonationServerFn({
            data: {
              txHash,
              sender: senderAddress || 'Anonymous',
              receiverId: user.id,
              amount: Number(amount),
              message: message || 'No message',
            }
          })
          setIsDonating(false)
          setTxHash(null)
          setMessage('')
        } catch (err) {
          console.error('Failed to record donation:', err)
        }
      }
      record()
    }
  }, [isSuccess, txHash, isDonating, user.id, amount, message, senderAddress])

  const handleDonate = async () => {
    if (!isConnected) return
    setIsDonating(true)
    try {
      let hash;
      
      if (user.isStakingEnabled) {
        // Mode Vault: Panggil function donate di Smart Contract
        hash = await writeContractAsync({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: TipFyVaultABI,
          functionName: 'donate',
          args: [user.walletAddress],
          value: parseEther(amount),
        })
      } else {
        // Mode Direct: Transfer MON langsung
        hash = await sendTransactionAsync({
          to: user.walletAddress as `0x${string}`,
          value: parseEther(amount),
        })
      }
      
      setTxHash(hash)
    } catch (err) {
      console.error('Donation failed:', err)
      setIsDonating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="relative p-8 border border-neon-cyan/20 bg-zinc-950/50 backdrop-blur-xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-neon-cyan p-1 overflow-hidden">
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} 
                  alt={user.username}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                  {user.displayName || user.username}
                </h1>
                <p className="text-neon-cyan font-mono tracking-widest text-sm">
                  @{user.username} {user.isStakingEnabled && <span className="text-[10px] bg-neon-pink/20 text-neon-pink px-2 py-0.5 ml-2 border border-neon-pink/30">Vault_Active</span>}
                </p>
              </div>
            </div>

            <p className="text-zinc-400 font-medium leading-relaxed italic border-l-2 border-neon-pink/50 pl-4">
              {user.bio || "No bio set. Just a regular legend on Tipfy."}
            </p>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                    Select_Amount (MON)
                  </label>
                  <button 
                    onClick={() => setIsPaused(!isCustom)}
                    className="text-[10px] font-black uppercase tracking-widest text-neon-cyan hover:text-white transition-colors"
                  >
                    {isCustom ? 'Use_Presets' : 'Custom_Amount'}
                  </button>
                </div>

                {isCustom ? (
                  <div className="relative group">
                    <input 
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setAmount(e.target.value)
                      }}
                      placeholder="Enter amount..."
                      className="w-full bg-zinc-900/50 border border-neon-cyan/30 p-4 text-white font-black italic focus:border-neon-cyan outline-none transition-all skew-x--5"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-neutral-600 uppercase">MON</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {['0.1', '1', '5', '10'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-3 font-black transition-all skew-x--5 ${
                          amount === val 
                          ? 'bg-neon-cyan text-black' 
                          : 'bg-zinc-900 text-zinc-500 hover:text-neon-cyan border border-zinc-800'
                        }`}
                      >
                        <span className="skew-x-5">{val}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                  Transmitter_Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your transmission..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 text-white font-mono focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all resize-none h-32 skew-x--2"
                />
              </div>

              {!isConnected ? (
                <ConnectKitButton.Custom>
                  {({ show }: any) => (
                    <button
                      onClick={show}
                      className="w-full py-6 bg-neon-cyan text-black font-black uppercase tracking-[0.5em] italic skew-x--10 hover:bg-white transition-all"
                    >
                      Authorize_Wallet_to_Donate
                    </button>
                  )}
                </ConnectKitButton.Custom>
              ) : (
                <button
                  onClick={handleDonate}
                  disabled={isDonating || isConfirming || !amount || Number(amount) <= 0}
                  className="group relative w-full py-6 bg-transparent overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 border-2 border-neon-pink group-hover:border-neon-cyan transition-colors" />
                  <div className="absolute inset-0 bg-neon-pink/10 group-hover:bg-neon-cyan/10 transition-colors" />
                  
                  <span className="relative z-10 text-xl font-black uppercase tracking-[0.5em] text-neon-pink group-hover:text-neon-cyan transition-colors">
                    {isDonating ? (isConfirming ? 'Confirming_Node...' : 'Transmitting...') : 'Initiate_Donation'}
                  </span>
                </button>
              )}
              
              {isConfirming && (
                <div className="text-center animate-pulse">
                  <p className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Awaiting_Block_Verification...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/u/$username')({
  component: ProfilePage,
})

function ProfilePage() {
  const { username } = Route.useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [Web3Lib, setWeb3Lib] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getPublicProfileServerFn({ data: username })
        setUser(profile)
      } catch (err) {
        console.error('User fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    
    const loadWeb3 = async () => {
      try {
        const [wagmi, viem, connectkit] = await Promise.all([
          import('wagmi'),
          import('viem'),
          import('connectkit')
        ])
        setWeb3Lib({
          useSendTransaction: wagmi.useSendTransaction,
          useWriteContract: wagmi.useWriteContract,
          useWaitForTransactionReceipt: wagmi.useWaitForTransactionReceipt,
          useAccount: wagmi.useAccount,
          parseEther: viem.parseEther,
          ConnectKitButton: connectkit.ConnectKitButton
        })
      } catch (e) {
        console.error('Web3 load failed:', e)
      }
    }

    fetchData()
    loadWeb3()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlitchText text="Loading_Profile..." className="text-neon-cyan text-4xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlitchText text="User_Not_Found" className="text-neon-pink text-4xl" />
      </div>
    )
  }

  if (!Web3Lib) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <GlitchText text="Initializing_Donation_Protocol..." className="text-neon-cyan text-2xl" />
      </div>
    )
  }

  return <ProfilePageInner 
    user={user} 
    Web3Lib={Web3Lib} 
  />
}
