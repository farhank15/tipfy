import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'
import { sessions, users } from '#/db/schema'
import * as cookie from 'cookie'

export const Route = createFileRoute('/api/auth/verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { address } = await request.json()
        
        await db.insert(users).values({
          walletAddress: address,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: users.walletAddress,
          set: { updatedAt: new Date() },
        })

        const sessionId = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await db.insert(sessions).values({
          id: sessionId,
          walletAddress: address,
          expiresAt: expiresAt,
        })

        return new Response(JSON.stringify({ ok: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie.serialize('session_id', sessionId, {
              path: '/',
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60,
            }),
          },
        })
      },
    },
  },
})
