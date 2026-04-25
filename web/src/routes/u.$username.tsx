import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { GlitchText } from '../components/ui/GlitchText'
import { getPublicProfileServerFn } from '../lib/auth-utils'
import { recordDonationServerFn } from '../lib/overlay-utils'
import { TipFyVaultABI } from '../lib/TipFyVaultABI'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000'

function ProfilePageInner({ 
  user, 
  Web3Lib
}: any) {
  const [amount, setAmount] = useState('0.1')
  const [message, setMessage] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const { useAccount, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, parseEther, ConnectKitButton } = Web3Lib
  const { isConnected, address: senderAddress } = useAccount()
  const [isCustom, setIsCustom] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  useEffect(() => {
    if (isSuccess && txHash && isDonating) {
      const record = async () => {
        try {
          await recordDonationServerFn({
            data: {
              streamerAddress: user.walletAddress,
              donorAddress: senderAddress || 'Anonymous',
              amount: amount,
              message: message || 'No message',
              nickname: senderAddress?.slice(0, 6) || 'Anonymous',
              txHash: txHash
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
  }, [isSuccess, txHash, isDonating, user.walletAddress, amount, message, senderAddress])

  const handleDonate = async () => {
    if (!isConnected) return
    setIsDonating(true)
    try {
      let hash;
      const isStaked = user.isStakingEnabled;
      
      if (isStaked) {
        hash = await writeContractAsync({
          address: VAULT_ADDRESS as `0x${string}`,
          abi: TipFyVaultABI,
          functionName: 'donate',
          args: [user.walletAddress, 'Anonymous', message, ''],
          value: parseEther(amount),
        })
      } else {
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
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,242,0.1),transparent_70%)]" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="relative p-8 border border-neon-cyan/20 bg-zinc-950/50 backdrop-blur-xl overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-32 h-32 rounded-full border-2 border-neon-cyan p-1 overflow-hidden shrink-0 shadow-[0_0_30px_rgba(0,255,242,0.2)]">
                  <img 
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.slug}`} 
                    alt={user.slug}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {user.displayName || user.slug}
                  </h1>
                  <p className="text-neon-cyan font-mono tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
                    <span className="opacity-50">@</span>{user.slug} 
                    {user.isStakingEnabled && (
                      <span className="text-[8px] bg-neon-pink text-white px-2 py-0.5 border border-neon-pink shadow-[0_0_10px_rgba(255,0,230,0.5)]">
                        VAULT_ACTIVE
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="relative p-6 bg-white/2 border border-white/5 skew-x--2">
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink shadow-[0_0_10px_rgba(255,0,230,0.5)]" />
                <p className="text-zinc-400 font-medium leading-relaxed italic text-sm">
                  {user.bio || "No bio set. Just a regular legend on the Tipfy grid."}
                </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500">Initialize_Transmission</h3>
                  <button 
                    onClick={() => setIsCustom(!isCustom)}
                    className="text-[10px] font-black uppercase tracking-widest text-neon-cyan hover:text-white transition-colors flex items-center gap-2"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isCustom ? 'bg-neon-cyan animate-pulse' : 'bg-zinc-800'}`} />
                    {isCustom ? 'USE_PRESETS' : 'CUSTOM_AMOUNT'}
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
                      className="w-full bg-black border border-neon-cyan/30 p-5 text-white font-black italic text-xl focus:border-neon-cyan outline-none transition-all skew-x--5"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-neon-cyan/50 uppercase tracking-widest">MON</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {['0.1', '1', '5', '10'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-4 font-black transition-all skew-x--10 border flex items-center justify-center ${
                          amount === val 
                          ? 'bg-neon-cyan border-neon-cyan text-black shadow-[0_0_20px_rgba(0,255,242,0.3)]' 
                          : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="skew-x-10 text-lg">{val}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-1">Transmitter_Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your transmission message..."
                    className="w-full bg-black border border-white/5 p-5 text-white font-mono text-sm focus:border-neon-pink outline-none transition-all resize-none h-32 skew-x--2"
                  />
                </div>

                {!isConnected ? (
                  <ConnectKitButton.Custom>
                    {({ show }: any) => (
                      <button
                        onClick={show}
                        className="w-full py-6 bg-neon-cyan text-black font-black uppercase tracking-[0.5em] italic skew-x--10 hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,242,0.2)]"
                      >
                        Authorize_Wallet_to_Donate
                      </button>
                    )}
                  </ConnectKitButton.Custom>
                ) : (
                  <button
                    onClick={handleDonate}
                    disabled={isDonating || isConfirming || !amount || Number(amount) <= 0}
                    className="group relative w-full py-6 bg-transparent overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed skew-x--10"
                  >
                    <div className="absolute inset-0 border-2 border-neon-pink group-hover:border-neon-cyan transition-colors" />
                    <div className="absolute inset-0 bg-neon-pink/5 group-hover:bg-neon-cyan/5 transition-colors" />
                    
                    <span className="relative z-10 text-xl font-black uppercase tracking-[0.5em] text-neon-pink group-hover:text-neon-cyan transition-colors">
                      {isDonating ? (isConfirming ? 'VERIFYING_BLOCK...' : 'TRANSMITTING...') : 'INITIATE_DONATION'}
                    </span>
                  </button>
                )}
                
                {isConfirming && (
                  <div className="text-center">
                    <p className="text-[10px] font-black text-neon-cyan uppercase tracking-widest animate-pulse">Awaiting_Block_Verification_In_Monad_Grid...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Navbar />
        <GlitchText text="User_Not_Found" className="text-neon-pink text-4xl" />
        <Footer />
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
