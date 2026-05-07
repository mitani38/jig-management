'use client'
import { useState, useMemo } from 'react'
import QRCode from 'react-qr-code'
import type { Jig } from '@/types'

export default function QRPrintView({ jigs }: { jigs: Jig[] }) {
  const customers = useMemo(() => Array.from(new Set(jigs.map(j => j.customer).filter(Boolean))).sort(), [jigs])
  const [filterCustomer, setFilterCustomer] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = filterCustomer ? jigs.filter(j => j.customer === filterCustomer) : jigs

  const allFilteredIds = filtered.map(j => j.jig_id)
  const allChecked = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.has(id))

  function toggleAll() {
    if (allChecked) {
      setSelected(prev => { const s = new Set(prev); allFilteredIds.forEach(id => s.delete(id)); return s })
    } else {
      setSelected(prev => new Set([...prev, ...allFilteredIds]))
    }
  }

  function toggle(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* コントロールバー（印刷時は非表示） */}
      <div className="print:hidden space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <a href="/admin" className="text-blue-600 text-sm">← 管理メニュー</a>
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              QRラベル印刷 <span className="text-sm font-normal text-gray-500">
                （{selected.size > 0 ? `${selected.size}件選択中` : `${filtered.length}件`}）
              </span>
            </h1>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700"
          >
            🖨️ 印刷する
          </button>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-3 flex gap-3 items-center">
          <select
            value={filterCustomer}
            onChange={e => { setFilterCustomer(e.target.value); setSelected(new Set()) }}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">すべての客先</option>
            {customers.map(c => <option key={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 accent-blue-700" />
            全選択
          </label>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-600">
              選択解除
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
          .print-label { break-inside: avoid; border: 1px dashed #aaa; padding: 8mm; height: 95mm; box-sizing: border-box; }
          .print-excluded { display: none !important; }
        }
      `}</style>

      {/* ラベルグリッド */}
      <div className="print-grid grid grid-cols-2 gap-2">
        {filtered.map(jig => {
          return (
            <div
              key={jig.jig_id}
              className={`print-label border rounded-lg p-4 flex gap-3 items-start cursor-pointer relative ${
                selected.size > 0 && !selected.has(jig.jig_id)
                  ? 'opacity-40 border-dashed border-gray-200 print-excluded'
                  : selected.has(jig.jig_id)
                  ? 'border-blue-400 border-2 bg-blue-50'
                  : 'border-dashed border-gray-300'
              }`}
              onClick={() => toggle(jig.jig_id)}
            >
              <div className="print:hidden absolute top-1 right-1">
                <input
                  type="checkbox"
                  checked={selected.has(jig.jig_id)}
                  onChange={() => toggle(jig.jig_id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 accent-blue-700"
                />
              </div>
              <div className="flex-shrink-0">
                <QRCode value={`https://jig-management.vercel.app/jigs/${jig.jig_id}`} size={90} />
                <p className="text-xs font-mono text-center mt-1 text-gray-500">{jig.jig_id}</p>
              </div>
              <div className="flex-1 min-w-0 text-xs space-y-0.5">
                <p className="font-bold text-sm text-gray-800 truncate">{jig.customer}</p>
                <p className="text-gray-600 truncate">{jig.project_name}</p>
                <p className="text-gray-500">No.{jig.no}</p>
                {jig.drawing_number && <p className="text-gray-500 truncate">図: {jig.drawing_number}</p>}
                {jig.work_order_number && <p className="text-gray-500 truncate">指: {jig.work_order_number}</p>}
                {jig.product_name && <p className="text-gray-500 truncate">{jig.product_name}</p>}
                {jig.storage_location && <p className="font-medium text-blue-700">{jig.storage_location} {jig.storage_area}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
