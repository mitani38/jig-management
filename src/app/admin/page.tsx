import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import type { Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ count: jigsCount }, { count: usersCount }] = await Promise.all([
    supabase.from('jigs').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const menuItems = [
    { href: '/admin/jigs/new', icon: '➕', label: '治具を新規登録', desc: '新しい治具・金型を登録する' },
    { href: '/admin/users', icon: '👥', label: 'ユーザー管理', desc: `現在 ${usersCount || 0} 名登録中` },
    { href: '/admin/qr-print', icon: '🖨️', label: 'QRラベル印刷', desc: '全治具のQRラベルを印刷する' },
    { href: '/admin/import', icon: '📥', label: 'データインポート', desc: 'CSVからデータを一括登録する' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar profile={profile as Profile} />
      <main className="flex-1 pb-20 sm:pb-0 max-w-2xl mx-auto w-full px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">管理者メニュー</h1>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-800">{jigsCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">登録治具数</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-800">{usersCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">ユーザー数</p>
          </div>
        </div>

        {/* メニュー */}
        <div className="space-y-3">
          {menuItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
