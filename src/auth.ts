import { createClient, type Session } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined

export const supabase = url && anon ? createClient(url, anon) : null

export type AppUser = { id: string; email: string; role: 'admin' }

export function isSupabaseConfigured() {
  return Boolean(supabase && adminEmail)
}

export async function loginAdmin(password: string): Promise<AppUser> {
  if (!supabase || !adminEmail) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_ADMIN_EMAIL to .env.local.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail.trim(), password })
  if (error || !data.user) throw new Error(error?.message ?? 'Admin login failed')
  const user = await getAdminProfile(data.user.id, data.user.email ?? adminEmail)
  return user
}

export async function restoreAdminSession(): Promise<AppUser | null> {
  if (!supabase || !adminEmail) return null
  const { data } = await supabase.auth.getSession()
  if (!data.session?.user) return null
  try {
    return await getAdminProfile(data.session.user.id, data.session.user.email ?? adminEmail)
  } catch {
    await supabase.auth.signOut()
    return null
  }
}

export function listenForAuthChanges(onUser: (user: AppUser | null) => void) {
  if (!supabase) return () => undefined
  const { data } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
    if (!session?.user) {
      onUser(null)
      return
    }
    try {
      onUser(await getAdminProfile(session.user.id, session.user.email ?? adminEmail ?? ''))
    } catch {
      onUser(null)
    }
  })
  return () => data.subscription.unsubscribe()
}

export async function logoutAdmin() {
  if (supabase) await supabase.auth.signOut()
}

export async function changePassword(newPassword: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)
}

async function getAdminProfile(id: string, email: string): Promise<AppUser> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('profiles').select('role').eq('id', id).single()
  if (error) throw new Error(error.message)
  if (data.role !== 'admin') {
    await supabase.auth.signOut()
    throw new Error('This account does not have administrator permission.')
  }
  return { id, email, role: 'admin' }
}
