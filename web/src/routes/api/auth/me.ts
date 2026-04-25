import { createFileRoute } from '@tanstack/react-router'
import { checkProfileExistence } from '../../../lib/db-actions.server'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async () => {
        const { hasProfile, walletAddress } = await checkProfileExistence()

        if (!walletAddress) {
          return new Response(JSON.stringify({ user: null }), {
            headers: { 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          user: { address: walletAddress },
          hasProfile 
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  }
})
