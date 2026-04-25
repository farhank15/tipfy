import { useEffect, useState, type ReactNode } from 'react'

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [Web3Components, setWeb3Components] = useState<any>(null)

  useEffect(() => {
    // Hanya jalankan ini di browser
    const loadWeb3 = async () => {
      try {
        const { WagmiProvider, createConfig, http } = await import('wagmi')
        const { mainnet } = await import('wagmi/chains')
        const { ConnectKitProvider, getDefaultConfig } = await import('connectkit')
        const { defineChain } = await import('viem')

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

  if (!mounted || !Web3Components) {
    // Saat SSR (di Vercel), kita hanya render children tanpa provider
    return <>{children}</>
  }

  const { WagmiProvider, ConnectKitProvider, config } = Web3Components

  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiProvider>
  )
}
