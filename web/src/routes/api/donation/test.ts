import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'
import { donation, profile, sessions } from '#/db/schema'
import * as cookie from 'cookie'
import { eq } from 'drizzle-orm'
import { env } from '#/env'

export const Route = createFileRoute('/api/donation/test')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookies = cookie.parse(request.headers.get('cookie') || '')
        const sessionId = cookies.session_id

        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        try {
          const sessionData = await db.query.sessions.findFirst({
            where: eq(sessions.id, sessionId)
          })

          if (!sessionData) {
            return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401 })
          }

          const targetProfile = await db.query.profile.findFirst({
            where: eq(profile.walletAddress, sessionData.walletAddress)
          })

          if (!targetProfile) {
            return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 })
          }

          // Create a fake test donation
          const [newDonation] = await db.insert(donation).values({
            profileId: targetProfile.id,
            senderName: 'Bagiyo',
            amount: '69',
            txHash: `TEST-${Date.now()}`,
            message: 'Halo! Ini adalah notifikasi test dari Dashboard Tipfy. 🔥',
            currency: 'MON',
          }).returning()

          // Real-time trigger via Ably
          try {
            const { default: Ably } = await import('ably')
            const ably = new Ably.Rest(env.ABLY_API_KEY)
            const channel = ably.channels.get(
              `donations:${targetProfile.walletAddress}`,
            )
            await channel.publish('new-donation', newDonation)
            console.log(
              `[Ably] Published test donation to channel: donations:${targetProfile.walletAddress}`,
            )
          } catch (ablyErr) {
            console.error('[Ably] Publish failed:', ablyErr)
          }

          return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e: any) {
          console.error('[Test Alert API] Error:', e)
          return new Response(JSON.stringify({ error: e.message }), { status: 500 })
        }
      }
    }
  }
})
