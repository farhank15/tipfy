import { describe, it, expect, vi, beforeEach } from 'vitest'
import { publishDonationAlert } from './ably-utils'
import Ably from 'ably'

const publishMock = vi.fn().mockResolvedValue(undefined)
const getChannelMock = vi.fn(() => ({
  publish: publishMock,
}))

// Mock Ably
vi.mock('ably', () => {
  return {
    default: {
      Rest: vi.fn(() => ({
        channels: {
          get: getChannelMock,
        },
      })),
    },
  }
})

vi.mock('#/env', () => ({
  env: {
    ABLY_API_KEY: 'test-key',
  },
}))

describe('publishDonationAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    publishMock.mockResolvedValue(undefined)
  })

  it('should publish a donation event to the correct channel', async () => {
    const donation = { id: 1, senderName: 'Alice', amount: '10' }
    const walletAddress = '0x123'
    
    await publishDonationAlert(walletAddress, donation)
    
    expect(Ably.Rest).toHaveBeenCalled()
    expect(getChannelMock).toHaveBeenCalledWith('donations:0x123')
    expect(publishMock).toHaveBeenCalledWith('new-donation', donation)
  })

  it('should throw an error if Ably publishing fails', async () => {
    publishMock.mockRejectedValue(new Error('Ably Error'))

    await expect(publishDonationAlert('0x123', {})).rejects.toThrow('Ably Error')
  })
})
