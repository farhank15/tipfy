import { createFileRoute } from '@tanstack/react-router'
import { db } from '#/db/index'
import { donation } from '#/db/schema'
import { censorMessageServerFn } from '../../../lib/ai-utils'
import { verifyMonadTransaction } from '#/lib/monad-utils'

export const Route = createFileRoute('/api/donation/record')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { slug, senderAddress, senderName, amount, txHash, message } =
            await request.json()

          const targetProfile = await db.query.profile.findFirst({
            where: (p, { eq }) => eq(p.slug, slug),
          })

          if (!targetProfile) {
            return new Response(
              JSON.stringify({ error: 'Profile not found' }),
              { status: 404 },
            )
          }

          // Verify transaction on Monad network
          console.log(`[Donation API] Verifying transaction: ${txHash}`)
          const verification = await verifyMonadTransaction(txHash)
          
          if (verification.status !== 'confirmed') {
            return new Response(
              JSON.stringify({ 
                error: `Transaction verification failed: status is ${verification.status}`,
                verification 
              }),
              { status: 400 },
            )
          }

          let filteredMessage = message
          if (message) {
            try {
              const result = await (censorMessageServerFn as any)({
                data: { message },
              })
              filteredMessage = result.censored
            } catch (err) {
              console.error('[AI Shield] Failed:', err)
            }
          }

          const donationData = {
            profileId: targetProfile.id,
            senderAddress: senderAddress,
            senderName: senderName || 'Anonymous',
            amount: amount,
            txHash: txHash,
            message: filteredMessage,
            currency: 'MON',
            status: verification.status,
            blockNumber: verification.blockNumber,
          }

          const [newDonation] = await db
            .insert(donation)
            .values(donationData)
            .returning()

          // Robust Alert Delivery via central utility
          try {
            const { publishDonationAlert } = await import('#/lib/ably-utils')
            await publishDonationAlert(targetProfile.walletAddress, newDonation)
          } catch (ablyErr) {
            console.error('[Ably] Publish failed, alert not sent:', ablyErr)
            // Note: We still return success as the donation is recorded in DB
          }

          return new Response(JSON.stringify({ ok: true, donation: newDonation }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (e: any) {
          console.error('[Donation API] Error:', e)
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
          })
        }
      },
    },
  },
})
