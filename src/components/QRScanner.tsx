'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const router = useRouter()

  async function startScan() {
    setError('')
    setResult('')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    setScanning(true)
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setResult(decodedText)
          scanner.stop()
          setScanning(false)
          router.push(`/jigs/${decodedText}`)
        },
        undefined
      )
    } catch {
      setError('カメラへのアクセスができませんでした。カメラの使用を許可してください。')
      setScanning(false)
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      setScanning(false)
    }
  }

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-gray-800 mb-6 text-center">QRコードスキャン</h1>

      <div id="qr-reader" className="w-full rounded-xl overflow-hidden mb-4" />

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      {result && <p className="text-green-600 text-sm text-center mb-4">✅ 読み取り成功: {result}</p>}

      {!scanning ? (
        <button
          onClick={startScan}
          className="w-full bg-blue-800 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition"
        >
          📷 スキャン開始
        </button>
      ) : (
        <button
          onClick={stopScan}
          className="w-full bg-red-500 text-white py-4 rounded-xl text-lg font-bold hover:bg-red-600 transition"
        >
          ■ 停止
        </button>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        治具に貼付されたQRコードをカメラに向けてください
      </p>
    </div>
  )
}
