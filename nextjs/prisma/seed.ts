import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const db = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)

  await db.user.upsert({
    where: { email: 'admin@vastuplan.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@vastuplan.com',
      passwordHash,
      role: 'admin',
    },
  })

  console.log('Seed complete: admin@vastuplan.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
