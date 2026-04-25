import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlitchText } from '../ui/GlitchText'
import { TipFyVaultABI } from '../../lib/TipFyVaultABI'

const TIPFY_VAULT_ADDRESS = (import.meta.env.VITE_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

function CommandCenterInner({ 
  useReadContract, 
  useWriteContract, 
  useAccount, 
  formatEther 
}: any) {
  const { address } = useAccount()
  
  const { data: stakedBalance } = useReadContract({
    address: TIPFY_VAULT_ADDRESS,
    abi: TipFyVaultABI,
    functionName: 'stakedBalance',
    args: [address],
  })

  const { data: claimableYield } = useReadContract({
    address: TIPFY_VAULT_ADDRESS,
    abi: TipFyVaultABI,
    functionName: 'getClaimableYield',
    args: [address],
  })

  const { writeContract: claimYield } = useWriteContract()

  const handleClaim = () => {
    claimYield({
      address: TIPFY_VAULT_ADDRESS,
      abi: TipFyVaultABI,
      functionName: 'claimYield',
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 border-t-2 border-r-2 border-neon-cyan" />
          </div>
          <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Total_Staked</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white italic">
              {stakedBalance ? formatEther(stakedBalance) : '0.00'}
            </span>
            <span className="text-neon-cyan text-sm font-bold">MON</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 border-t-2 border-r-2 border-neon-pink" />
          </div>
          <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Claimable_Yield</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white italic">
              {claimableYield ? formatEther(claimableYield) : '0.00'}
            </span>
            <span className="text-neon-pink text-sm font-bold">MON</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col justify-center items-center gap-4">
          <button
            onClick={handleClaim}
            disabled={!claimableYield || claimableYield === 0n}
            className="w-full py-4 bg-transparent relative overflow-hidden group disabled:opacity-30"
          >
            <div className="absolute inset-0 border-2 border-neon-cyan group-hover:bg-neon-cyan/10 transition-all" />
            <span className="relative z-10 font-black text-neon-cyan uppercase tracking-widest">
              Claim_Rewards
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function CommandCenter() {
  const [Web3Lib, setWeb3Lib] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [wagmi, viem] = await Promise.all([
          import('wagmi'),
          import('viem')
        ])
        setWeb3Lib({
          useReadContract: wagmi.useReadContract,
          useWriteContract: wagmi.useWriteContract,
          useAccount: wagmi.useAccount,
          formatEther: viem.formatEther
        })
      } catch (e) {
        console.error('CommandCenter Web3 Load failed', e)
      }
    }
    load()
  }, [])

  if (!Web3Lib) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-zinc-800">
        <span className="text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse">
          Accessing_Vault_Metrics...
        </span>
      </div>
    )
  }

  return <CommandCenterInner {...Web3Lib} />
}
