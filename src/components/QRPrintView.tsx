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

  const printTargets = selected.size > 0 ? filtered.filter(j => selected.has(j.jig_id)) : filtered

  return (
    <div>
      <style>{`
        @media print {
          /* ナビゲーションを完全非表示 */
          header, nav, .print\\:hidden { display: none !important; }
          body { margin: 0; padding: 0; }

          /* 1ラベル = A5 1ページ */
          .print-label-page {
            width: 148mm;
            height: 210mm;
            page-break-after: always;
            break-after: page;
            display: flex !important;
            box-sizing: border-box;
            overflow: hidden;
          }
          .print-label-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          .no-print { display: none !important; }
          @page { size: A5 portrait; margin: 0; }
        }
      `}</style>

      {/* コントロールバー（印刷時は非表示） */}
      <div className="no-print max-w-4xl mx-auto px-4 py-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <a href="/admin" className="text-blue-600 text-sm">← 管理メニュー</a>
            <h1 className="text-xl font-bold text-gray-800 mt-1">
              QRラベル印刷
              <span className="text-sm font-normal text-gray-500 ml-2">
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

        {/* 画面プレビュー */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(jig => (
            <div
              key={jig.jig_id}
              onClick={() => toggle(jig.jig_id)}
              className={`border rounded-xl p-4 flex gap-3 items-start cursor-pointer relative transition ${
                selected.size > 0 && !selected.has(jig.jig_id)
                  ? 'opacity-40 border-dashed border-gray-200'
                  : selected.has(jig.jig_id)
                  ? 'border-blue-400 border-2 bg-blue-50'
                  : 'border-dashed border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="absolute top-2 right-2">
                <input type="checkbox" checked={selected.has(jig.jig_id)} onChange={() => toggle(jig.jig_id)}
                  onClick={e => e.stopPropagation()} className="w-4 h-4 accent-blue-700" />
              </div>
              <QRCode value={`https://jig-management.vercel.app/jigs/${jig.jig_id}`} size={72} />
              <div className="flex-1 min-w-0 text-xs space-y-0.5">
                <p className="font-bold text-sm text-gray-800 truncate">{jig.customer}</p>
                <p className="text-gray-600 truncate">{jig.project_name}</p>
                <p className="text-gray-500">No.{jig.no}</p>
                {jig.drawing_number && <p className="text-gray-500 truncate">図: {jig.drawing_number}</p>}
                {jig.work_order_number && <p className="text-gray-500 truncate">指: {jig.work_order_number}</p>}
                {jig.product_name && <p className="text-gray-500 truncate">{jig.product_name}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 印刷用ラベル（1枚 = A5 1ページ） */}
      <div className="hidden print:block">
        {printTargets.map(jig => (
          <div key={jig.jig_id} className="print-label-page" style={{padding: '8mm', flexDirection: 'column', gap: '5mm'}}>
            {/* ヘッダー */}
            <div style={{background: '#1e3a8a', color: '#fff', padding: '4mm 6mm', borderRadius: '2mm'}}>
              <div style={{fontSize: '13pt', fontWeight: 'bold'}}>治具・金型 識別ラベル</div>
              <div style={{fontSize: '8pt', opacity: 0.8, marginTop: '1mm'}}>三谷合金製作所 治具管理システム</div>
            </div>

            {/* QR + 情報 */}
            <div style={{display: 'flex', gap: '6mm', flex: 1}}>
              <div style={{flexShrink: 0, textAlign: 'center'}}>
                <QRCode value={`https://jig-management.vercel.app/jigs/${jig.jig_id}`} size={140} />
                <div style={{fontFamily: 'monospace', fontSize: '7pt', color: '#374151', marginTop: '2mm'}}>{jig.jig_id}</div>
              </div>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10pt'}}>
                <tbody>
                  {[
                    ['客先', jig.customer],
                    ['案件名', jig.project_name],
                    ['指令書番号', jig.work_order_number],
                    ['図面番号', jig.drawing_number],
                    ['品名', jig.product_name],
                    ['分類', jig.category],
                    ['状態', jig.status],
                  ].map(([label, value]) => value ? (
                    <tr key={label as string} style={{borderBottom: '1px solid #e5e7eb'}}>
                      <td style={{padding: '3mm 2mm', color: '#6b7280', whiteSpace: 'nowrap', verticalAlign: 'top', fontSize: '8pt', width: '26mm'}}>{label}</td>
                      <td style={{padding: '3mm 2mm', color: '#111827', fontWeight: 600}}>{value}</td>
                    </tr>
                  ) : null)}
                </tbody>
              </table>
            </div>

            {/* フッター */}
            <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '2mm', fontSize: '7pt', color: '#9ca3af'}}>
              登録日: {new Date().toLocaleDateString('ja-JP')} ／ No.{jig.no} ／ 三谷合金製作所
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
