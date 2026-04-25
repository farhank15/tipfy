import Ably from 'ably'
import { env } from '#/env'

let ably: Ably.Rest | null = null

function getAblyClient() {
  if (!ably) {
    ably = new Ably.Rest(env.ABLY_API_KEY)
  }
  return ably
}

export async function publishDonationAlert(walletAddress: string, donationData: any) {
  try {
    const client = getAblyClient()
    const channelName = `donations:${walletAddress}`
    const channel = client.channels.get(channelName)
    
    await channel.publish('new-donation', donationData)
    console.log(`[Ably] Published donation to channel: ${channelName}`)
  } catch (error) {
    console.error('[Ably] Publish failed:', error)
    throw error
  }
}
