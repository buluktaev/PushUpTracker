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

function resolveProfileName(user: User, existingName?: string): string {
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
  if (metadataName) return metadataName

  const persistedName = existingName?.trim() ?? ''
  if (persistedName) return persistedName

  return inferName(user)
}

export async function ensureProfile(user: User) {
  if (!user.email) {
    throw new Error('User email is required')
  }

  const email = user.email.trim()
  const byId = await prisma.profile.findUnique({
    where: { id: user.id },
  })
  if (byId) {
    const name = resolveProfileName(user, byId.name)
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
    const name = resolveProfileName(user, byEmail.name)
    return prisma.profile.update({
      where: { email },
      data: {
        id: user.id,
        name,
      },
    })
  }

  const name = resolveProfileName(user)

  return prisma.profile.create({
    data: {
      id: user.id,
      email,
      name,
    },
  })
}
