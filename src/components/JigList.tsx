'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Jig, Profile } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  '保管（客先資産）': 'bg-blue-100 text-blue-800',
  '使用中': 'bg-yellow-100 text-yellow-800',
  '廃棄済': 'bg-red-100 text-red-800',
  '返却済': 'bg-gray-100 text-gray-600',
  'その他': 'bg-purple-100 text-purple-800',
}

function exportCSV(jigs: Jig[]) {
  const headers = ['No', '治具ID', '客先', '案件名', '図面番号', '指令書番号', '客先注文番号', '品名', '分類', '保管場所', '保管エリア', '状態', '備考']
  const rows = jigs.map(j => [
    j.no, j.jig_id, j.customer, j.project_name, j.drawing_number, j.work_order_number,
    j.customer_order_number, j.product_name, j.category, j.storage_location, j.storage_area, j.status, j.notes,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`))
  const csv = '﻿' + [headers, ...rows].map(r => r.join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `治具一覧_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function JigList({ profile }: { profile: Profile | null }) {
  const [jigs, setJigs] = useState<Jig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const supabase = createClient()

  const fetchJigs = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('jigs')
      .select('*')
      .order('no', { ascending: true })

    if (filterStatus) query = query.eq('status', filterStatus)
    if (filterCategory) query = query.eq('category', filterCategory)
    if (search) {
      query = query.or(
        `customer.ilike.%${search}%,project_name.ilike.%${search}%,jig_id.ilike.%${search}%,drawing_number.ilike.%${search}%,product_name.ilike.%${search}%`
      )
    }

    const { data } = await query
    setJigs(data || [])
    setLoading(false)
  }, [search, filterStatus, filterCategory, supabase])

  useEffect(() => {
    fetchJigs()

    // リアルタイム更新
    const channel = supabase
      .channel('jigs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jigs' }, fetchJigs)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchJigs, supabase])

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">治具一覧 <span className="text-sm font-normal text-gray-500">({jigs.length}件)</span></h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(jigs)}
            disabled={jigs.length === 0}
            className="bg-green-700 text-white text-sm px-3 py-2 rounded-lg hover:bg-green-600 disabled:opacity-40"
          >
            CSV出力
          </button>
          {profile?.role === 'admin' && (
            <Link href="/admin/jigs/new" className="bg-blue-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
              ＋ 新規登録
            </Link>
          )}
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-3 mb-4 space-y-2">
        <input
          type="text"
          placeholder="🔍 客先・案件名・治具ID・図面番号で検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">すべての状態</option>
            <option>保管（客先資産）</option>
            <option>使用中</option>
            <option>廃棄済</option>
            <option>返却済</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">すべての分類</option>
            <option>コイル</option>
            <option>鉄心</option>
          </select>
        </div>
      </div>

      {/* 治具リスト */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : jigs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">治具が見つかりません</div>
      ) : (
        <div className="space-y-2">
          {jigs.map(jig => (
            <Link key={jig.id} href={`/jigs/${jig.jig_id}`}>
              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition cursor-pointer border border-transparent hover:border-blue-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">#{jig.no}</span>
                      <span className="font-semibold text-gray-800 truncate">{jig.customer}</span>
                      {jig.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{jig.category}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{jig.project_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{jig.product_name} {jig.storage_location && `｜ ${jig.storage_location} ${jig.storage_area || ''}`}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[jig.status || ''] || 'bg-gray-100 text-gray-600'}`}>
                      {jig.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
