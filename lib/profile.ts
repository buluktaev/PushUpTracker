import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

type AuthMetadataClient = {
  auth: {
    updateUser(attributes: { data: Record<string, unknown> }): Promise<{ error: Error | null }>
  }
}

function getMetadataName(user: User): string {
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
  if (metadataName) return metadataName

  const displayName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.trim() : ''
  if (displayName) return displayName

  const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  if (fullName) return fullName

  return ''
}

function inferName(user: User): string {
  const metadataName = getMetadataName(user)
  if (metadataName) return metadataName

  const email = user.email?.trim() ?? ''
  if (email) {
    const local = email.split('@')[0]?.trim()
    if (local) return local
  }

  return 'user'
}

function resolveProfileName(user: User, existingName?: string): string {
  const metadataName = getMetadataName(user)
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

export async function syncAuthUserName(
  supabase: AuthMetadataClient,
  user: User,
  fallbackName?: string
) {
  const resolvedName = (fallbackName ?? '').trim() || resolveProfileName(user)
  if (!resolvedName) return

  const metadata = user.user_metadata ?? {}
  const nameMatches = typeof metadata.name === 'string' && metadata.name.trim() === resolvedName
  const displayNameMatches = typeof metadata.display_name === 'string' && metadata.display_name.trim() === resolvedName
  const fullNameMatches = typeof metadata.full_name === 'string' && metadata.full_name.trim() === resolvedName

  if (nameMatches && displayNameMatches && fullNameMatches) return

  const { error } = await supabase.auth.updateUser({
    data: {
      ...metadata,
      name: resolvedName,
      display_name: resolvedName,
      full_name: resolvedName,
    },
  })

  if (error) {
    throw error
  }
}
