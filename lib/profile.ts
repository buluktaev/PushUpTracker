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

  const email = user.email.trim()
  const name = inferName(user)

  const byId = await prisma.profile.findUnique({
    where: { id: user.id },
  })
  if (byId) {
    return prisma.profile.update({
      where: { id: user.id },
      data: {
        email,
        name,
      },
    })
  }

  const byEmail = await prisma.profile.findUnique({
    where: { email },
  })
  if (byEmail) {
    return prisma.profile.update({
      where: { email },
      data: {
        id: user.id,
        name,
      },
    })
  }

  return prisma.profile.create({
    data: {
      id: user.id,
      email,
      name,
    },
  })
}
