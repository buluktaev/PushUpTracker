import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

function inferName(user: User): string {
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
  if (metadataName) return metadataName

  const email = user.email?.trim() ?? ''
  if (email) {
    const local = email.split('@')[0]?.trim()
    if (local) return local
  }

  return 'user'
}

export async function ensureProfile(user: User) {
  if (!user.email) {
    throw new Error('User email is required')
  }

  const name = inferName(user)

  return prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name,
    },
    create: {
      id: user.id,
      email: user.email,
      name,
    },
  })
}
