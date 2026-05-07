'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types'

interface Props { profile: Profile | null }

export default function NavBar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: '一覧', icon: '📋' },
    { href: '/admin/jigs/new', label: '新規登録', icon: '➕' },
    { href: '/scan', label: 'QRスキャン', icon: '📷' },
    ...(profile?.role === 'admin' ? [{ href: '/admin', label: '管理', icon: '⚙️' }] : []),
  ]

  return (
    <>
      {/* PC上部ナビ */}
      <header className="hidden sm:flex bg-blue-900 text-white items-center justify-between px-6 h-14 shadow">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">🔧 治具管理</span>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-1.5 rounded ${pathname.startsWith(item.href) ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-200">{profile?.name || profile?.email}</span>
          {profile?.role === 'admin' && <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-0.5 rounded font-bold">管理者</span>}
          <button onClick={handleLogout} className="text-blue-300 hover:text-white">ログアウト</button>
        </div>
      </header>

      {/* スマホ下部タブバー */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${pathname.startsWith(item.href) ? 'text-blue-800 font-bold' : 'text-gray-500'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
