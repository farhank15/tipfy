import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'

export const Route = createFileRoute('/api/auth/check-username')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const username = url.searchParams.get('username')?.toLowerCase()

        if (!username || username.length < 3) {
          return new Response(JSON.stringify({ available: false, error: 'Too short' }), { status: 400 })
        }

        try {
          const existing = await db.query.profile.findFirst({
            where: (profile, { eq }) => eq(profile.slug, username)
          })

          return new Response(JSON.stringify({ available: !existing }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          return new Response(JSON.stringify({ available: false, error: 'DB Error' }), { status: 500 })
        }
      }
    }
  }
})
