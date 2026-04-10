import HomePageClient from '@/components/HomePageClient'
import { ensureProfile, syncAuthUserName } from '@/lib/profile'
import { createClient } from '@/lib/supabase-server'

export default async function HomePage() {
  let initialProfileName = ''

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const profile = await ensureProfile(user)
      await syncAuthUserName(supabase, user, profile.name)
      initialProfileName = profile.name?.trim() ?? ''
    }
  } catch {}

  return <HomePageClient initialProfileName={initialProfileName} />
}
