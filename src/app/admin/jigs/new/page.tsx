import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import JigForm from '@/components/JigForm'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NewJigPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0">
        <JigForm mode="new" userId={user.id} />
      </main>
    </div>
  )
}
