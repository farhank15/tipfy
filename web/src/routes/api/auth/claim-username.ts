import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'
import { profile } from '#/db/schema'
import * as cookie from 'cookie'
import { seedDefaultOverlays } from '../../../lib/overlay-utils'

export const Route = createFileRoute('/api/auth/claim-username')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookies = cookie.parse(request.headers.get('cookie') || '')
        const sessionId = cookies.session_id

        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        try {
          const { username } = await request.json()
          
          const sessionData = await db.query.sessions.findFirst({
            where: (sessions, { eq }) => eq(sessions.id, sessionId)
          })

          if (!sessionData) {
            return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401 })
          }

          const existing = await db.query.profile.findFirst({
            where: (profile, { eq }) => eq(profile.slug, username)
          })

          if (existing) {
            return new Response(JSON.stringify({ error: 'Username taken' }), { status: 400 })
          }

          const [newProfile] = await db.insert(profile).values({
            walletAddress: sessionData.walletAddress,
            slug: username,
            displayName: username,
          }).returning()

          // Seed default overlays for new user
          if (newProfile) {
            await seedDefaultOverlays(newProfile.id)
          }

          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e: any) {
          console.error('[Claim API] Error:', e)
          return new Response(JSON.stringify({ error: e.message }), { status: 500 })
        }
      }
    }
  }
})
