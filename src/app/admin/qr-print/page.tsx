import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import QRPrintView from '@/components/QRPrintView'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function QRPrintPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: jigs } = await supabase
    .from('jigs')
    .select('*')
    .not('status', 'in', '("廃棄済","返却済")')
    .order('no')

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0">
        <QRPrintView jigs={jigs || []} />
      </main>
    </div>
  )
}
