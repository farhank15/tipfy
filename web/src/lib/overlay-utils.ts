import { createServerFn } from '@tanstack/react-start'
import { eq, and, desc } from 'drizzle-orm'
import crypto from 'node:crypto'

export const recordDonationServerFn = createServerFn({
  method: 'POST',
}).handler(async (ctx: { data: any }) => {
    const { txHash, sender, receiverId, amount, message } = ctx.data
    const { db } = await import('#/db/index')
    const { donation, profile } = await import('#/db/schema')
    const { getAblyInstance } = await import('./ably-utils')

    try {
      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.id, receiverId),
      })
      if (!userProfile) throw new Error('Receiver not found')

      await db.insert(donation).values({
        profileId: receiverId,
        amount: amount.toString(),
        senderName: sender.length === 42 ? 'Anonymous' : sender,
        senderAddress: sender.length === 42 ? sender : null,
        message,
        txHash,
        status: 'SUCCESS',
      })

      const ably = getAblyInstance()
      const channel = ably.channels.get(`donations:${userProfile.walletAddress}`)
      
      await channel.publish('new-donation', {
        id: crypto.randomUUID(),
        senderName: sender.length === 42 ? `${sender.slice(0, 6)}...${sender.slice(-4)}` : sender,
        amount: amount.toString(),
        currency: 'MON',
        message,
        timestamp: Date.now(),
      })

      return { success: true }
    } catch (e) {
      console.error('[RecordDonation Error]:', e)
      throw e
    }
  })

export const getOverlayConfigServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { type } = ctx.data
    const { getOverlayConfig } = await import('./db-actions.server')
    return await getOverlayConfig(type) as any
  })

export const getPublicOverlayConfigServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { type, address } = ctx.data
    const { db } = await import('#/db/index')
    const { overlayConfigs, profile } = await import('#/db/schema')

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.walletAddress, address),
    })
    if (!userProfile) throw new Error('Profile not found')

    const config = await db.query.overlayConfigs.findFirst({
      where: and(
        eq(overlayConfigs.profileId, userProfile.id),
        eq(overlayConfigs.type, type.toUpperCase()),
      ),
    })

    return (config || null) as any
  })

export const getLatestDonationServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { address } = ctx.data
    const { db } = await import('#/db/index')
    const { donation, profile } = await import('#/db/schema')

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.walletAddress, address),
    })
    if (!userProfile) return null

    const latest = await db.query.donation.findFirst({
      where: eq(donation.profileId, userProfile.id),
      orderBy: [desc(donation.createdAt)],
    })

    return latest as any
  })

export const getDonationsServerFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<any[]> => {
    const { getDonations } = await import('./db-actions.server')
    return await getDonations() as any[]
  },
)

export const getDashboardStatsServerFn = createServerFn({
  method: 'GET',
}).handler(async (): Promise<any> => {
  const { getDashboardStats } = await import('./db-actions.server')
  return await getDashboardStats() as any
})

export const saveOverlayConfigServerFn = createServerFn({
  method: 'POST',
}).handler(async (ctx: { data: any }) => {
    const { type, config, isEnabled } = ctx.data
    const { saveOverlayConfig } = await import('./db-actions.server')
    return await saveOverlayConfig(type, config, isEnabled)
  })

export const saveVotingServerFn = createServerFn({
  method: 'POST',
}).handler(async (ctx: { data: any }) => {
    const { saveVoting } = await import('./db-actions.server')
    return await saveVoting(ctx.data) as any
  })

export const getActiveVotingServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { profileId } = ctx.data
    const { getActiveVoting } = await import('./db-actions.server')
    return await getActiveVoting(profileId) as any
  })

export const submitVoteServerFn = createServerFn({
  method: 'POST',
}).handler(async (ctx: { data: any }) => {
    const { votingId, optionIndex, voterAddress } = ctx.data
    const { submitVote } = await import('./db-actions.server')
    return await submitVote(votingId, optionIndex, voterAddress)
  })

export const getVotingResultsServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { votingId } = ctx.data
    const { getVotingResults } = await import('./db-actions.server')
    return await getVotingResults(votingId) as any[]
  })

export const getLeaderboardServerFn = createServerFn({
  method: 'GET',
}).handler(async (ctx: { data: any }) => {
    const { profileId, timeRange, startDate } = ctx.data
    const { getLeaderboardData } = await import('./db-actions.server')
    return await getLeaderboardData(profileId, timeRange, startDate) as any[]
  })

export const seedDefaultOverlays = async (profileId: number) => {
  try {
    const { db } = await import('#/db/index')
    const { overlayConfigs } = await import('#/db/schema')

    const baseConfig = {
      backgroundColor: '#00000000',
      textColor: '#ffffff',
      highlightColor: '#00f3ff',
      minAmount: 1,
      minTtsAmount: 5,
      minMediaAmount: 10,
      duration: 5000,
      ttsEnabled: true,
      ttsVoice: 'id-ID-Standard-A',
      mediaEnabled: true,
      blockedKeywords: '',
      sounds: [],
      profanityEnabled: true,
      gamblingEnabled: true,
      pinjolEnabled: true,
      saraEnabled: true,
    }

    const ALL_TYPES = [
      'ALERT',
      'SOUNDBOARD',
      'SUBATHON',
      'VOTING',
      'QR_CODE',
      'MILESTONE',
      'LEADERBOARD',
      'RUNNING_TEXT',
      'WHEEL',
    ]

    for (const type of ALL_TYPES) {
      const existing = await db.query.overlayConfigs.findFirst({
        where: (p: any, { eq, and }: any) => and(
          eq(p.profileId, profileId),
          eq(p.type, type),
        ),
      })

      if (!existing) {
        await db.insert(overlayConfigs).values({
          profileId,
          type: type,
          config:
            type === 'MILESTONE'
              ? {
                  ...baseConfig,
                  title: 'Target Donasi',
                  target: 1000,
                  current: 0,
                }
              : type === 'SUBATHON'
                ? {
                    ...baseConfig,
                    initialHours: 1,
                    initialMinutes: 0,
                    initialSeconds: 0,
                    rules: [
                      { amount: 5000, hours: 0, minutes: 1, seconds: 0 },
                      { amount: 10000, hours: 0, minutes: 2, seconds: 30 },
                    ],
                    showBorder: true,
                    fontWeight: '900',
                    fontSize: '64px',
                  }
                : type === 'LEADERBOARD'
                ? { ...baseConfig, title: 'Top Supporters', period: 'alltime' }
                : baseConfig,
        })
      }
    }
  } catch (e) {
    console.error('[Seed Error]:', e)
  }
}
