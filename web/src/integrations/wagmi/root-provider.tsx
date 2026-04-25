import { useEffect, useState, type ReactNode } from 'react'

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [Web3Components, setWeb3Components] = useState<any>(null)

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        // Gunakan import standar, guard di vite.config.ts akan menangani sisi server
        const [
          { WagmiProvider, createConfig, http },
          { mainnet },
          { ConnectKitProvider, getDefaultConfig },
          { defineChain }
        ] = await Promise.all([
          import('wagmi'),
          import('wagmi/chains'),
          import('connectkit'),
          import('viem')
        ])

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

        const projectId = import.meta.env.VITE_WC_PROJECT_ID || '49cc0f94fd76627001ad0ff75091fb9c'

        const config = createConfig(
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

        setWeb3Components({ WagmiProvider, ConnectKitProvider, config })
        setMounted(true)
      } catch (err) {
        console.error('Failed to load Web3 components:', err)
      }
    }

    loadWeb3()
  }, [])

  // Sangat Penting: Jika belum mounted, jangan render children yang menggunakan hooks Web3
  // Ini untuk mencegah error "useConfig must be used within WagmiProvider"
  if (!mounted || !Web3Components) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
         <div className="text-neon-cyan font-black uppercase tracking-[0.5em] animate-pulse">
           Initializing_Grid_Nodes...
         </div>
      </div>
    )
  }

  const { WagmiProvider, ConnectKitProvider, config } = Web3Components

  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiProvider>
  )
}
