import { createFileRoute } from '@tanstack/react-router'
import * as cookie from 'cookie'
import { db } from '#/db/index'
import { sessions } from '#/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookies = cookie.parse(request.headers.get('cookie') || '')
        const sessionId = cookies.session_id

        if (sessionId) {
          await db.delete(sessions).where(eq(sessions.id, sessionId))
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie.serialize('session_id', '', {
              path: '/',
              httpOnly: true,
              expires: new Date(0),
            }),
          },
        })
      },
    },
  },
})
