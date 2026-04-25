import { createFileRoute } from '@tanstack/react-router'
import { generateSiweNonce } from 'viem/siwe'
import * as cookie from 'cookie'

export const Route = createFileRoute('/api/auth/nonce')({
  server: {
    handlers: {
      GET: async () => {
        const nonce = generateSiweNonce()
        console.log('[API] Generated Nonce:', nonce)

        return new Response(JSON.stringify({ nonce }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie.serialize('siwe_nonce', nonce, {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 5,
            }),
          },
        })
      },
    },
  },
})
