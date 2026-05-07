import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import UserManager from '@/components/UserManager'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase.from('profiles').select('*').order('created_at')

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0">
        <UserManager users={(users || []) as Profile[]} currentUserId={user.id} />
      </main>
    </div>
  )
}
