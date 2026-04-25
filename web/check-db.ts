import { db } from './src/db/index'
import { profile } from './src/db/schema'

async function check() {
  const allProfiles = await db.select().from(profile)
  console.log('Profiles in DB:', JSON.stringify(allProfiles, null, 2))
  process.exit(0)
}

check()
