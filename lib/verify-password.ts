import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function verifyPassword(email: string, password: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  await supabase.auth.signOut({ scope: 'local' })

  return !error
}
