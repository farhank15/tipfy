import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    GROQ_API_KEY: z.string().min(1),
    GCS_BUCKET_NAME: z.string().min(1),
    GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1),
    ABLY_API_KEY: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
  },
  clientPrefix: 'VITE_',
  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_WC_PROJECT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    ...process.env,
    ...import.meta.env,
  },
  emptyStringAsUndefined: true,
})
