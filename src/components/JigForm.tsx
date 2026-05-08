'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Jig } from '@/types'
import { JIG_STATUS_OPTIONS, JIG_CATEGORY_OPTIONS } from '@/types'

function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface Props {
  mode: 'new' | 'edit'
  jig?: Jig
  userId: string
}

export default function JigForm({ mode, jig, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    jig_id: jig?.jig_id || generateId(),
    no: jig?.no?.toString() || '',
    customer: jig?.customer || '',
    project_name: jig?.project_name || '',
    drawing_number: jig?.drawing_number || '',
    work_order_number: jig?.work_order_number || '',
    customer_order_number: jig?.customer_order_number || '',
    product_name: jig?.product_name || '',
    storage_location: jig?.storage_location || '',
    storage_area: jig?.storage_area || '',
    status: jig?.status || '保管（客先資産）',
    notes: jig?.notes || '',
    category: jig?.category || '',
    disposal_return_date: jig?.disposal_return_date || '',
    disposal_return_reason: jig?.disposal_return_reason || '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      no: form.no ? parseInt(form.no) : null,
      disposal_return_date: form.disposal_return_date || null,
      updated_by: userId,
    }

    if (mode === 'new') {
      const { error } = await supabase.from('jigs').insert({ ...payload, created_by: userId })
      if (!error) {
        await supabase.from('jig_history').insert({
          jig_id: form.jig_id, action: '新規登録',
          new_values: payload, changed_by: userId,
        })
        fetch('/api/notify-jig-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(console.error)
        router.push(`/jigs/${form.jig_id}`)
      }
    } else {
      const { error } = await supabase.from('jigs').update(payload).eq('jig_id', jig!.jig_id)
      if (!error) {
        await supabase.from('jig_history').insert({
          jig_id: jig!.jig_id, action: '情報更新',
          old_values: jig, new_values: payload, changed_by: userId,
        })
        router.push(`/jigs/${jig!.jig_id}`)
      }
    }
    setSaving(false)
  }

  const fields = [
    { key: 'no', label: 'No.', type: 'number', required: false },
    { key: 'customer', label: '客先', type: 'text', required: true },
    { key: 'project_name', label: '案件名', type: 'text', required: false },
    { key: 'drawing_number', label: '図面番号', type: 'text', required: false },
    { key: 'work_order_number', label: '指令書番号', type: 'text', required: false },
    { key: 'customer_order_number', label: '客先注文番号', type: 'text', required: false },
    { key: 'product_name', label: '品名', type: 'text', required: false },
    { key: 'storage_location', label: '保管場所', type: 'text', required: false },
    { key: 'storage_area', label: '保管エリア', type: 'text', required: false },
    { key: 'disposal_return_date', label: '廃棄・返却日', type: 'date', required: false },
    { key: 'disposal_return_reason', label: '廃棄・返却理由', type: 'text', required: false },
    { key: 'notes', label: '備考', type: 'text', required: false },
  ]

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-blue-600 text-sm">← 戻る</button>
        <h1 className="text-xl font-bold text-gray-800">{mode === 'new' ? '治具を新規登録' : '治具を編集'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        {/* 治具ID */}
        <div>
          <label className="block text-xs font-medium text-gray-800 mb-1">治具固有ID</label>
          <div className="flex gap-2">
            <input
              value={form.jig_id}
              readOnly={mode === 'edit'}
              onChange={e => set('jig_id', e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50 text-gray-900"
            />
            {mode === 'new' && (
              <button type="button" onClick={() => set('jig_id', generateId())}
                className="text-xs bg-gray-100 px-3 rounded-lg hover:bg-gray-200">
                再生成
              </button>
            )}
          </div>
        </div>

        {/* 状態・分類 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-800 mb-1">状態</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900">
              {JIG_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-800 mb-1">分類</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900">
              <option value="">選択してください</option>
              {JIG_CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* テキストフィールド */}
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-800 mb-1">
              {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={e => set(f.key, e.target.value)}
              required={f.required}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : mode === 'new' ? '登録する' : '更新する'}
        </button>
      </form>
    </div>
  )
}
