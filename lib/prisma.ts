import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const ca = fs.readFileSync(path.join(process.cwd(), 'certs/yandex-ca.pem')).toString()
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { ca },
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
