import { createFileRoute } from '@tanstack/react-router'
import { env } from '#/env'

export const Route = createFileRoute('/api/auth/ably-token')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { default: Ably } = await import('ably')
          const client = new Ably.Rest(env.ABLY_API_KEY)
          const tokenRequestData = await client.auth.createTokenRequest({
            clientId: 'tipfy-widget-client',
          })
          return new Response(JSON.stringify(tokenRequestData), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
          })
        }
      },
    },
  },
})
