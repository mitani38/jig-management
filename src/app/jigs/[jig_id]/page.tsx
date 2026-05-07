import { createClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import NavBar from '@/components/NavBar'
import JigDetail from '@/components/JigDetail'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function JigDetailPage({ params }: { params: Promise<{ jig_id: string }> }) {
  const { jig_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jig } = await supabase.from('jigs').select('*').eq('jig_id', jig_id).single()
  if (!jig) notFound()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: history } = await supabase
    .from('jig_history')
    .select('*, profiles(name, email)')
    .eq('jig_id', jig_id)
    .order('changed_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0">
        <JigDetail jig={jig} profile={profile as Profile} history={history || []} />
      </main>
    </div>
  )
}
