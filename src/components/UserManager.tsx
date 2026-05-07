'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'

export default function UserManager({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('staff')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setMessage('')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(`✅ ${inviteEmail} に招待メールを送信しました`)
      setInviteEmail('')
    } else {
      setMessage(`❌ エラー: ${data.error}`)
    }
    setInviting(false)
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-blue-600 text-sm">← 管理メニュー</a>
        <h1 className="text-xl font-bold text-gray-800">ユーザー管理</h1>
      </div>

      {/* 新規招待 */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">新規ユーザーを招待</h2>
        <form onSubmit={handleInvite} className="space-y-3">
          <input
            type="email"
            placeholder="メールアドレス"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as UserRole)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="staff">一般スタッフ</option>
            <option value="admin">管理者</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="w-full bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {inviting ? '送信中...' : '招待メールを送る'}
          </button>
        </form>
        {message && <p className="text-sm mt-3">{message}</p>}
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">登録ユーザー一覧 ({users.length}名)</h2>
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{u.name || '（名前未設定）'}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              {u.id === currentUserId ? (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{u.role === 'admin' ? '管理者' : '一般'} (自分)</span>
              ) : (
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                  className="text-xs border border-gray-200 rounded px-2 py-1"
                >
                  <option value="staff">一般</option>
                  <option value="admin">管理者</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
