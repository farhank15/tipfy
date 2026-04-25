import { createServerFn } from '@tanstack/react-start'

export const getPayoutSettingsServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { getPayoutSettings } = await import('./db-actions.server')
  return await getPayoutSettings()
})

export const updatePayoutSettingsServerFn = createServerFn({
  method: 'POST',
}).handler(async (ctx: any) => {
  const { payoutAddress, isStakingEnabled } = ctx.data as { payoutAddress: string, isStakingEnabled: boolean }
  const { updatePayoutSettings } = await import('./db-actions.server')
  return await updatePayoutSettings(payoutAddress, isStakingEnabled)
})
