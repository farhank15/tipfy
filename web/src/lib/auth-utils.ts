import { createServerFn } from '@tanstack/react-start'
import { deleteCookie } from '@tanstack/react-start/server'

export const logoutServerFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    deleteCookie('session_id')
    return { success: true }
  })

export const checkProfileServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { checkProfileExistence: serverAction } = await import('./db-actions.server')
    return await serverAction()
  })

export const syncSessionServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { checkProfileExistence: serverAction } = await import('./db-actions.server')
    const res = await serverAction()
    
    if (res.isAuthenticated && res.walletAddress) {
      return {
        user: {
          address: res.walletAddress,
          username: res.slug || null
        }
      }
    }
    return null
  })

export const getPublicProfileServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: identifier }) => {
    const { db } = await import('#/db/index')
    
    try {
      // Cari berdasarkan slug (username) ATAU walletAddress
      const userProfile = await db.query.profile.findFirst({
        where: (p: any, { eq, or }: any) => or(
          eq(p.slug, identifier),
          eq(p.walletAddress, identifier)
        ),
        with: {
          payoutSettings: true,
        },
      })

      if (!userProfile) {
        console.warn(`[ServerFn] Profile not found for identifier: ${identifier}`)
        return null
      }

      return {
        id: userProfile.id,
        displayName: userProfile.displayName,
        username: userProfile.slug,
        avatarUrl: userProfile.avatarUrl,
        walletAddress: userProfile.walletAddress,
        bio: userProfile.bio,
        isStakingEnabled: (userProfile as any).payoutSettings?.isStakingEnabled || false,
        payoutAddress: (userProfile as any).payoutSettings?.payoutAddress || userProfile.walletAddress,
      }
    } catch (e: any) {
      console.error('[ServerFn Error Details]:', {
        message: e.message,
        stack: e.stack,
        identifier
      })
      return null
    }
  })
