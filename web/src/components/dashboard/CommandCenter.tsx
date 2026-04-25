import { useEffect, useState } from 'react'
import { TipFyVaultABI } from '../../lib/TipFyVaultABI'

const TIPFY_VAULT_ADDRESS = (import.meta.env.VITE_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

function CommandCenterInner({ 
  useReadContract, 
  useWriteContract, 
  useAccount, 
  formatEther,
  parseEther
}: any) {
  const { address } = useAccount()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  
  const { data: stakedBalance, refetch: refetchBalance } = useReadContract({
    address: TIPFY_VAULT_ADDRESS,
    abi: TipFyVaultABI,
    functionName: 'balances',
    args: [address],
    query: {
      staleTime: 30000, // Data dianggap segar selama 30 detik
      refetchOnWindowFocus: false // Jangan refetch setiap kali pindah tab
    }
  })

  const { data: claimableYield, refetch: refetchYield } = useReadContract({
    address: TIPFY_VAULT_ADDRESS,
    abi: TipFyVaultABI,
    functionName: 'calculateYield',
    args: [address],
    query: {
      staleTime: 60000, // Yield lambat, cukup cek 1 menit sekali
      refetchOnWindowFocus: false
    }
  })

  const { writeContract } = useWriteContract()

  const handleClaim = () => {
    writeContract({
      address: TIPFY_VAULT_ADDRESS,
      abi: TipFyVaultABI,
      functionName: 'claimYield' as any,
    }, {
      onSuccess: () => {
        setTimeout(() => {
          refetchBalance()
          refetchYield()
        }, 2000)
      }
    })
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return
    
    writeContract({
      address: TIPFY_VAULT_ADDRESS,
      abi: TipFyVaultABI,
      functionName: 'withdraw',
      args: [parseEther(withdrawAmount)],
    }, {
      onSuccess: () => {
        setWithdrawAmount('')
        setTimeout(() => {
          refetchBalance()
          refetchYield()
        }, 2000)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 relative overflow-hidden group skew-x--2">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 border-t-2 border-r-2 border-neon-cyan" />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Vault_Principal_Balance</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white italic tracking-tighter">
              {stakedBalance ? Number(formatEther(stakedBalance)).toFixed(4) : '0.0000'}
            </span>
            <span className="text-neon-cyan text-lg font-black italic">MON</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Secured_by_Aave_V3</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 relative overflow-hidden group skew-x--2">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 border-t-2 border-r-2 border-neon-pink" />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Accrued_Protocol_Yield</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white italic tracking-tighter">
              {claimableYield ? Number(formatEther(claimableYield)).toFixed(4) : '0.0000'}
            </span>
            <span className="text-neon-pink text-lg font-black italic">MON</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-pink" />
            <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">3.5%_Fixed_APR_Growth</span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/2 border border-white/5 p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Withdraw_Principal</h4>
            <p className="text-[9px] text-neutral-500 uppercase tracking-tighter leading-none mb-4">Extract funds from the secure vault back to your grid wallet.</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-black border border-white/10 p-4 font-mono text-xs text-white focus:border-neon-cyan focus:outline-none transition-colors skew-x--5"
            />
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || !stakedBalance || stakedBalance === 0n}
              className="px-8 bg-neon-cyan text-black font-black uppercase tracking-widest text-xs italic hover:bg-white transition-all disabled:opacity-30 skew-x--5"
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-white/2 border border-white/5 p-8 flex flex-col justify-center items-center gap-6">
          <div className="text-center space-y-2">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Claim_Protocol_Rewards</h4>
            <p className="text-[9px] text-neutral-500 uppercase tracking-tighter max-w-[200px]">Rewards are available after 365 days of continuous transmission.</p>
          </div>
          
          <button
            onClick={handleClaim}
            disabled={!claimableYield || claimableYield === 0n}
            className="w-full py-4 border-2 border-neon-pink text-neon-pink font-black uppercase tracking-[0.3em] italic hover:bg-neon-pink hover:text-white transition-all disabled:opacity-30 skew-x--5"
          >
            Claim_Yield
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
          formatEther: viem.formatEther,
          parseEther: viem.parseEther
        })
      } catch (e) {
        console.error('CommandCenter Web3 Load failed', e)
      }
    }
    load()
  }, [])

  if (!Web3Lib) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800">
        <span className="text-zinc-600 font-black uppercase tracking-[0.4em] animate-pulse">
          Accessing_Vault_Metrics...
        </span>
      </div>
    )
  }

  return <CommandCenterInner {...Web3Lib} />
}
