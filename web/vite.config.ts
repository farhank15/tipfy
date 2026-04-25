import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import neon from './neon-vite-plugin.ts'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    allowedHosts: true,
  },
  plugins: [
    devtools(),
    nitro({ 
      rollupConfig: { 
        external: [
          /^@sentry\//,
          'wagmi',
          'connectkit',
          'viem',
          'framer-motion',
          '@aave/account',
          'post-robot'
        ] 
      } 
    }),
    neon,
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  ssr: {
    // Memaksa library ini agar tidak diproses oleh SSR Vite sama sekali
    external: [
      'wagmi',
      'connectkit',
      'viem',
      'wagmi/chains',
      '@aave/account',
      'post-robot'
    ]
  }
})

export default config
