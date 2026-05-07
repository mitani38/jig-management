import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import JigList from '@/components/JigList'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0">
        <JigList profile={profile as Profile} />
      </main>
    </div>
  )
}
