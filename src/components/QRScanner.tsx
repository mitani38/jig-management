'use client'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  async function startScan() {
    setError('')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    setScanning(true)
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          scanner.stop()
          setScanning(false)
          try {
            const url = new URL(decodedText)
            window.location.href = url.href
          } catch {
            window.location.href = `/jigs/${decodedText}`
          }
        },
        undefined
      )
    } catch {
      setError('カメラを起動できませんでした。\nカメラの使用を許可してください。')
      setScanning(false)
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      setScanning(false)
    }
  }

  // ページを開いたら自動でスキャン開始
  useEffect(() => {
    startScan()
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-black flex flex-col items-center justify-center overflow-hidden">

      {/* カメラ映像エリア */}
      <div id="qr-reader" className="w-full absolute inset-0 [&>*]:!border-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

      {/* 暗いオーバーレイ（四隅） */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 上 */}
          <div className="absolute top-0 left-0 right-0 bg-black/50" style={{height: 'calc(50% - 120px)'}} />
          {/* 下 */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{height: 'calc(50% - 120px)'}} />
          {/* 左 */}
          <div className="absolute left-0 bg-black/50" style={{top: 'calc(50% - 120px)', height: '240px', width: 'calc(50% - 120px)'}} />
          {/* 右 */}
          <div className="absolute right-0 bg-black/50" style={{top: 'calc(50% - 120px)', height: '240px', width: 'calc(50% - 120px)'}} />

          {/* 四隅のコーナーブラケット */}
          <div className="absolute" style={{top: 'calc(50% - 120px)', left: 'calc(50% - 120px)'}}>
            {/* 左上 */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-md" />
            {/* 右上 */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-md" />
            {/* 左下 */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-md" />
            {/* 右下 */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-md" />

            {/* スキャンライン */}
            <div className="absolute left-1 right-1 h-0.5 bg-blue-400 opacity-80 animate-scan" style={{top: '50%'}} />
          </div>
        </div>
      )}

      {/* テキスト・ボタン（最前面） */}
      <div className="absolute bottom-0 left-0 right-0 pb-10 px-6 flex flex-col items-center gap-4 z-10">
        {scanning && (
          <p className="text-white text-sm text-center drop-shadow">
            治具のQRコードを枠内に合わせてください
          </p>
        )}

        {error && (
          <p className="text-red-300 text-sm text-center whitespace-pre-line bg-black/60 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {scanning ? (
          <button
            onClick={stopScan}
            className="bg-white/20 backdrop-blur text-white border border-white/40 px-8 py-3 rounded-full font-medium hover:bg-white/30 transition"
          >
            ✕　キャンセル
          </button>
        ) : (
          <button
            onClick={startScan}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-base hover:bg-blue-500 transition shadow-lg"
          >
            📷　スキャン開始
          </button>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-80px); opacity: 0.6; }
          50% { transform: translateY(80px); opacity: 1; }
        }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
        #qr-reader { background: transparent !important; }
        #qr-reader > div { border: none !important; box-shadow: none !important; }
        #qr-reader img, #qr-reader button:not(.custom-btn), #qr-reader select { display: none !important; }
      `}</style>
    </div>
  )
}
