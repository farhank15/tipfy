import Ably from 'ably'

let ably: Ably.Realtime | null = null

export const getAblyInstance = () => {
  if (!ably) {
    const apiKey = process.env.ABLY_API_KEY
    if (!apiKey) {
      console.warn('ABLY_API_KEY is missing. Real-time features will be disabled.')
      // Return a mock or handle gracefully
    }
    ably = new Ably.Realtime({ key: apiKey })
  }
  return ably
}
