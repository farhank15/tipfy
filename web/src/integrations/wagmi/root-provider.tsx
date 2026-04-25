import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { useEffect, useState, useMemo, type ReactNode } from 'react'
import { defineChain } from 'viem'

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
})

const projectId =
  import.meta.env.VITE_WC_PROJECT_ID || '49cc0f94fd76627001ad0ff75091fb9c'

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const config = useMemo(() => {
    if (typeof window === 'undefined') return null
    
    return createConfig(
      getDefaultConfig({
        walletConnectProjectId: projectId,
        appName: 'Tipfy Protocol',
        chains: [monadTestnet, mainnet],
        transports: {
          [monadTestnet.id]: http(),
          [mainnet.id]: http('https://cloudflare-eth.com'),
        },
      }),
    )
  }, [])

  if (!mounted || !config) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiProvider>
  )
}
