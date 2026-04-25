import { createServerFn } from '@tanstack/react-start'

export const checkProfileServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { checkProfileExistence: serverAction } = await import('./db-actions.server')
    return await serverAction()
  })

export const getPublicProfileServerFn = createServerFn({ method: 'GET' })
  .handler(async ({ data: username }) => {
    const { db } = await import('#/db/index')
    
    try {
      const userProfile = await db.query.profile.findFirst({
        where: (p: any, { eq }: any) => eq(p.slug, username),
        with: {
          payoutSettings: true,
        },
      })

      if (!userProfile) {
        console.warn(`[ServerFn] Profile not found for slug: ${username}`)
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
        username
      })
      return null
    }
  })
