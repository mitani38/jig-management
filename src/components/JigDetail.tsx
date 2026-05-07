'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { createClient } from '@/lib/supabase'
import type { Jig, Profile, JigHistory } from '@/types'
import { JIG_STATUS_OPTIONS } from '@/types'

const FIELD_LABELS: Partial<Record<keyof Jig, string>> = {
  customer: '客先',
  project_name: '案件名',
  drawing_number: '図面番号',
  work_order_number: '指令書番号',
  customer_order_number: '客先注文番号',
  product_name: '品名',
  storage_location: '保管場所',
  storage_area: '保管エリア',
  status: '状態',
  category: '分類',
  notes: '備考',
  disposal_return_date: '廃棄・返却日',
  disposal_return_reason: '廃棄・返却理由',
}

export default function JigDetail({ jig, profile, history }: { jig: Jig; profile: Profile | null; history: JigHistory[] }) {
  const [newStatus, setNewStatus] = useState(jig.status || '')
  const [saving, setSaving] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleStatusUpdate() {
    if (newStatus === jig.status) return
    setSaving(true)
    const oldStatus = jig.status
    await supabase.from('jigs').update({ status: newStatus, updated_by: profile?.id }).eq('jig_id', jig.jig_id)
    await supabase.from('jig_history').insert({
      jig_id: jig.jig_id,
      action: '状態変更',
      old_values: { status: oldStatus },
      new_values: { status: newStatus },
      changed_by: profile?.id,
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard" className="text-blue-600 text-sm">← 一覧へ</Link>
        {profile?.role === 'admin' && (
          <Link href={`/admin/jigs/${jig.jig_id}/edit`} className="ml-auto text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
            ✏️ 編集
          </Link>
        )}
      </div>

      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-1">ID: {jig.jig_id} ／ No.{jig.no}</p>
            <h1 className="text-xl font-bold text-gray-800">{jig.customer}</h1>
            <p className="text-gray-600">{jig.project_name}</p>
          </div>
          <button onClick={() => setShowQR(!showQR)} className="text-2xl" title="QRコード">
            📱
          </button>
        </div>

        {showQR && (
          <div className="mt-4 flex flex-col items-center border-t pt-4">
            <QRCode value={jig.jig_id} size={160} />
            <p className="text-xs text-gray-400 mt-2 font-mono">{jig.jig_id}</p>
          </div>
        )}
      </div>

      {/* 状態変更（全ユーザー） */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">状態を更新</h2>
        <div className="flex gap-2">
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {JIG_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={saving || newStatus === jig.status}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40 hover:bg-blue-700"
          >
            {saving ? '保存中' : '更新'}
          </button>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">詳細情報</h2>
        <dl className="divide-y divide-gray-100">
          {(Object.keys(FIELD_LABELS) as (keyof Jig)[]).map(key => (
            jig[key] ? (
              <div key={key} className="flex py-2 gap-3">
                <dt className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{FIELD_LABELS[key]}</dt>
                <dd className="text-sm text-gray-800 flex-1">{String(jig[key])}</dd>
              </div>
            ) : null
          ))}
        </dl>
      </div>

      {/* 操作履歴 */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">操作履歴</h2>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="text-xs text-gray-600 border-l-2 border-blue-200 pl-3">
                <p className="font-medium">{h.action}</p>
                <p className="text-gray-400">{new Date(h.changed_at).toLocaleString('ja-JP')} ／ {h.profiles?.name || h.profiles?.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
