'use client'
import QRCode from 'react-qr-code'
import type { Jig } from '@/types'

export default function QRPrintView({ jigs }: { jigs: Jig[] }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <a href="/admin" className="text-blue-600 text-sm">← 管理メニュー</a>
          <h1 className="text-xl font-bold text-gray-800 mt-1">QRラベル印刷 ({jigs.length}件)</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700"
        >
          🖨️ 印刷する
        </button>
      </div>

      <style>{`
        @media print {
          .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
          .print-label { break-inside: avoid; border: 1px dashed #aaa; padding: 8mm; height: 95mm; box-sizing: border-box; }
        }
      `}</style>

      <div className="print-grid grid grid-cols-2 gap-2">
        {jigs.map(jig => (
          <div key={jig.jig_id} className="print-label border border-dashed border-gray-300 rounded-lg p-4 flex gap-3 items-start">
            <div className="flex-shrink-0">
              <QRCode value={jig.jig_id} size={90} />
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
        ))}
      </div>
    </div>
  )
}
