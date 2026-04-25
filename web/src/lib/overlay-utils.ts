import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

export const getDonationsServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const { db } = await import('#/db/index')
      const { donation, sessions, profile } = await import('#/db/schema')
      const { eq, desc } = await import('drizzle-orm')
      
      const sessionId = getCookie('session_id')
      if (!sessionId) return []

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId)
      })
      if (!session) return []

      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.walletAddress, session.walletAddress)
      })
      if (!userProfile) return []

      const data = await db.query.donation.findMany({
        where: eq(donation.profileId, userProfile.id),
        orderBy: [desc(donation.createdAt)],
        limit: 50
      })

      return data || []
    } catch (err) {
      console.error('getDonations error:', err)
      return []
    }
  })

export const getDashboardStatsServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const { db } = await import('#/db/index')
      const { donation, sessions, profile } = await import('#/db/schema')
      const { eq, sql, count, countDistinct } = await import('drizzle-orm')
      
      const sessionId = getCookie('session_id')
      if (!sessionId) return { totalEarnings: '0', totalDonations: 0, uniqueWallets: 0 }

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId)
      })
      if (!session) return { totalEarnings: '0', totalDonations: 0, uniqueWallets: 0 }

      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.walletAddress, session.walletAddress)
      })
      if (!userProfile) return { totalEarnings: '0', totalDonations: 0, uniqueWallets: 0 }

      const [stats] = await db
        .select({
          totalEarnings: sql<string>`sum(cast(${donation.amount} as numeric))`,
          totalDonations: count(donation.id),
          uniqueWallets: countDistinct(donation.senderAddress),
        })
        .from(donation)
        .where(eq(donation.profileId, userProfile.id))

      return {
        totalEarnings: stats?.totalEarnings || '0',
        totalDonations: Number(stats?.totalDonations) || 0,
        uniqueWallets: Number(stats?.uniqueWallets) || 0,
      }
    } catch (err) {
      console.error('getStats error:', err)
      return { totalEarnings: '0', totalDonations: 0, uniqueWallets: 0 }
    }
  })

export const recordDonationServerFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: { data: any }) => {
    const { streamerAddress, donorAddress, amount, message, nickname, txHash } = ctx.data
    
    try {
      const { db } = await import('#/db/index')
      const { donation, profile } = await import('#/db/schema')
      const { eq } = await import('drizzle-orm')
      
      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.walletAddress, streamerAddress)
      })
      if (!userProfile) throw new Error('Streamer profile not found')

      await db.insert(donation).values({
        profileId: userProfile.id,
        senderAddress: donorAddress,
        senderName: nickname || 'Anonymous',
        amount: amount.toString(),
        message: message || '',
        txHash: txHash
      })

      try {
        const { getAblyInstance } = await import('./ably-utils')
        const ably = getAblyInstance()
        const channel = ably.channels.get(`donations:${streamerAddress}`)
        await channel.publish('new-donation', {
          from: nickname || 'Anonymous',
          amount: amount,
          message: message,
          txHash: txHash
        })
      } catch (ablyErr) {
        console.error('Ably trigger failed:', ablyErr)
      }

      return { success: true }
    } catch (err) {
      console.error('recordDonation error:', err)
      throw err
    }
  })

export const getPublicOverlayConfigServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: { address, type } }: { data: { address: string; type: string } }) => {
    try {
      const { db } = await import('#/db/index')
      const { overlayConfigs, profile } = await import('#/db/schema')
      const { eq, and } = await import('drizzle-orm')

      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.walletAddress, address)
      })
      if (!userProfile) return null

      const config = await db.query.overlayConfigs.findFirst({
        where: and(
          eq(overlayConfigs.profileId, userProfile.id),
          eq(overlayConfigs.type, type)
        )
      })

      return config || null
    } catch (err) {
      console.error('getPublicOverlayConfig error:', err)
      return null
    }
  })

export const getOverlayConfigServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: type }: { data: string }) => {
    const { getOverlayConfig } = await import('./db-actions.server')
    return await getOverlayConfig(type)
  })

export const saveOverlayConfigServerFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: { data: { type: string; config: any; isEnabled?: boolean } }) => {
    const { saveOverlayConfig } = await import('./db-actions.server')
    return await saveOverlayConfig(ctx.data.type, ctx.data.config, ctx.data.isEnabled)
  })

export const saveVotingServerFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: { data: any }) => {
    const { saveVoting } = await import('./db-actions.server')
    return await saveVoting(ctx.data)
  })

export const getActiveVotingServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: profileId }: { data: number }) => {
    const { getActiveVoting } = await import('./db-actions.server')
    return await getActiveVoting(profileId)
  })

export const submitVoteServerFn = createServerFn({ method: 'POST' })
  .handler(async (ctx: { data: { votingId: number; optionIndex: number; voterAddress: string } }) => {
    const { submitVote } = await import('./db-actions.server')
    return await submitVote(ctx.data.votingId, ctx.data.optionIndex, ctx.data.voterAddress)
  })

export const getVotingResultsServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: votingId }: { data: number }) => {
    const { getVotingResults } = await import('./db-actions.server')
    return await getVotingResults(votingId)
  })

export const getLeaderboardDataServerFn = createServerFn({ method: 'GET' })
  .handler(async (ctx: { data: { profileId: number; timeRange: string; startDate?: string } }) => {
    const { getLeaderboardData } = await import('./db-actions.server')
    return await getLeaderboardData(ctx.data.profileId, ctx.data.timeRange, ctx.data.startDate)
  })
