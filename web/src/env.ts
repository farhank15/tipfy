import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    GROQ_API_KEY: z.string().min(1),
    ABLY_API_KEY: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    BETTER_AUTH_URL: z.string().min(1).optional(),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().optional(),
    VITE_WC_PROJECT_ID: z.string().optional(),
  },
  runtimeEnv: {
    ...process.env,
    ...import.meta.env,
  },
  emptyStringAsUndefined: true,
})
