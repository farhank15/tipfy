import { createServerFn } from '@tanstack/react-start'
import { eq, and, desc } from 'drizzle-orm'
import crypto from 'node:crypto'

export const recordDonationServerFn = createServerFn({
  method: 'POST',
}).handler(async ({ data: { txHash, sender, receiverId, amount, message } }) => {
    const { db } = await import('#/db/index')
    const { donation, profile } = await import('#/db/schema')
    const { getAblyInstance } = await import('./ably-utils')

    try {
      // 1. Get user address for channel naming
      const userProfile = await db.query.profile.findFirst({
        where: eq(profile.id, receiverId),
      })
      if (!userProfile) throw new Error('Receiver not found')

      // 2. Save to database
      await db.insert(donation).values({
        profileId: receiverId,
        amount: amount.toString(),
        senderName: sender.length === 42 ? 'Anonymous' : sender,
        senderAddress: sender.length === 42 ? sender : null,
        message,
        txHash,
        status: 'SUCCESS',
      })

      // 3. Trigger Overlay via Ably
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
}).handler(async ({ data: { type } }) => {
    const { getOverlayConfig } = await import('./db-actions.server')
    return await getOverlayConfig(type)
  })

export const getPublicOverlayConfigServerFn = createServerFn({
  method: 'GET',
}).handler(async ({ data: { type, address } }) => {
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

    return config || null
  })

export const getLatestDonationServerFn = createServerFn({
  method: 'GET',
}).handler(async ({ data: { address } }) => {
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

    return latest || null
  })

export const getDonationsServerFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<any[]> => {
    const { getDonations } = await import('./db-actions.server')
    return await getDonations()
  },
)

export const getDashboardStatsServerFn = createServerFn({
  method: 'GET',
}).handler(async (): Promise<any> => {
  const { getDashboardStats } = await import('./db-actions.server')
  return await getDashboardStats()
})

export const saveOverlayConfigServerFn = createServerFn({
  method: 'POST',
}).handler(async ({ data: { type, config, isEnabled } }) => {
    const { saveOverlayConfig } = await import('./db-actions.server')
    return await saveOverlayConfig(type, config, isEnabled)
  })

export const saveVotingServerFn = createServerFn({
  method: 'POST',
}).handler(async ({ data }) => {
    const { saveVoting } = await import('./db-actions.server')
    return await saveVoting(data)
  })

export const getActiveVotingServerFn = createServerFn({
  method: 'GET',
}).handler(async ({ data: { profileId } }) => {
    const { getActiveVoting } = await import('./db-actions.server')
    return await getActiveVoting(profileId)
  })

export const submitVoteServerFn = createServerFn({
  method: 'POST',
}).handler(async ({ data: { votingId, optionIndex, voterAddress } }) => {
    const { submitVote } = await import('./db-actions.server')
    return await submitVote(votingId, optionIndex, voterAddress)
  })

export const getVotingResultsServerFn = createServerFn({
  method: 'GET',
}).handler(async ({ data: { votingId } }) => {
    const { getVotingResults } = await import('./db-actions.server')
    return await getVotingResults(votingId)
  })

export const getLeaderboardServerFn = createServerFn({
  method: 'GET',
}).handler(async ({ data: { profileId, timeRange, startDate } }) => {
    const { getLeaderboardData } = await import('./db-actions.server')
    return await getLeaderboardData(profileId, timeRange, startDate)
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
        where: and(
          eq(overlayConfigs.profileId, profileId),
          eq(overlayConfigs.type, type),
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
