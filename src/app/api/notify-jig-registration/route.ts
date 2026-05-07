import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const TO = 'deki@mitanigoukin.co.jp'
const CC = 'yuichiro-mitani@mitanigoukin.co.jp'

export async function POST(req: NextRequest) {
  const jig = await req.json()

  const qrDataUrl = await QRCode.toDataURL(jig.jig_id, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const labelHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
@page { size: A5 portrait; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; width: 148mm; height: 210mm; padding: 8mm; }
.outer { width: 100%; height: 100%; border: 2px solid #1e3a8a; border-radius: 4mm; overflow: hidden; }
.header { background: #1e3a8a; color: #fff; padding: 3mm 5mm; }
.header h1 { font-size: 12pt; font-weight: bold; }
.header p { font-size: 8pt; opacity: 0.8; margin-top: 1mm; }
.body { padding: 5mm; display: flex; gap: 5mm; }
.qr-block { flex-shrink: 0; text-align: center; }
.qr-block img { width: 55mm; height: 55mm; display: block; }
.qr-id { font-family: monospace; font-size: 8pt; color: #374151; margin-top: 2mm; }
.info-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
.info-table tr { border-bottom: 1px solid #e5e7eb; }
.info-table th { width: 24mm; padding: 2.5mm 2mm; text-align: left; color: #6b7280; font-weight: normal; white-space: nowrap; vertical-align: top; }
.info-table td { padding: 2.5mm 2mm; color: #111827; font-weight: 600; }
.footer { padding: 2mm 5mm; border-top: 1px solid #e5e7eb; font-size: 7pt; color: #9ca3af; }
</style>
</head>
<body>
<div class="outer">
  <div class="header">
    <h1>治具・金型 識別ラベル</h1>
    <p>三谷合金製作所 治具管理システム</p>
  </div>
  <div class="body">
    <div class="qr-block">
      <img src="${qrDataUrl}" alt="QR" />
      <p class="qr-id">${jig.jig_id}</p>
    </div>
    <table class="info-table">
      <tr><th>客先</th><td>${jig.customer || '—'}</td></tr>
      <tr><th>案件名</th><td>${jig.project_name || '—'}</td></tr>
      <tr><th>指令書番号</th><td>${jig.work_order_number || '—'}</td></tr>
      <tr><th>図面番号</th><td>${jig.drawing_number || '—'}</td></tr>
      <tr><th>品名</th><td>${jig.product_name || '—'}</td></tr>
      <tr><th>分類</th><td>${jig.category || '—'}</td></tr>
      <tr><th>保管場所</th><td>${[jig.storage_location, jig.storage_area].filter(Boolean).join(' ') || '—'}</td></tr>
      <tr><th>状態</th><td>${jig.status || '—'}</td></tr>
    </table>
  </div>
  <div class="footer">登録日: ${new Date().toLocaleDateString('ja-JP')} ／ 三谷合金製作所</div>
</div>
</body>
</html>`

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 12px;border:1px solid #ddd;background:#f8f9fa;font-weight:bold;width:40%;color:#374151;">${label}</td>
      <td style="padding:8px 12px;border:1px solid #ddd;color:#111827;">${value || '—'}</td>
    </tr>`

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:20px;background:#f3f4f6;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

    <div style="background:#1e3a8a;color:#fff;padding:20px 24px;">
      <h1 style="margin:0;font-size:18px;">🔧 治具・金型 新規登録のお知らせ</h1>
      <p style="margin:6px 0 0;font-size:13px;opacity:0.8;">三谷合金製作所 治具管理システム</p>
    </div>

    <div style="padding:24px;">
      <p style="margin:0 0 20px;color:#374151;">以下の治具が新規登録されました。<br>QRラベル（添付ファイル）を印刷して治具に貼付してください。</p>

      <table style="border-collapse:collapse;width:100%;margin-bottom:24px;font-size:14px;">
        ${row('治具固有ID', `<span style="font-family:monospace;font-size:15px;font-weight:bold;">${jig.jig_id}</span>`)}
        ${row('客先', jig.customer)}
        ${row('案件名', jig.project_name)}
        ${row('図面番号', jig.drawing_number)}
        ${row('指令書番号', jig.work_order_number)}
        ${row('客先注文番号', jig.customer_order_number)}
        ${row('品名', jig.product_name)}
        ${row('分類', jig.category)}
        ${row('状態', jig.status)}
        ${row('保管場所', jig.storage_location)}
        ${row('保管エリア', jig.storage_area)}
        ${row('備考', jig.notes)}
      </table>

      <div style="text-align:center;padding:20px;border:2px dashed #93c5fd;border-radius:8px;background:#eff6ff;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-weight:bold;color:#1e3a8a;">QRコード</p>
        <img src="${qrDataUrl}" style="width:180px;height:180px;" alt="QR Code" />
        <p style="margin:10px 0 0;font-family:monospace;font-size:14px;color:#374151;font-weight:bold;">${jig.jig_id}</p>
      </div>

      <p style="color:#6b7280;font-size:12px;margin:0;">
        このメールは治具管理システムから自動送信されています。<br>
        詳細は <a href="https://jig-management.vercel.app" style="color:#1e3a8a;">治具管理システム</a> からご確認ください。
      </p>
    </div>
  </div>
</body>
</html>`

  const subject = ['【治具新規登録】', jig.customer, jig.project_name]
    .filter(Boolean).join(' ')

  try {
    await transporter.sendMail({
      from: `治具管理システム <${process.env.GMAIL_USER}>`,
      to: TO,
      cc: CC,
      subject,
      html,
      attachments: [
        {
          filename: `治具ラベル_${jig.jig_id}.html`,
          content: Buffer.from(labelHtml, 'utf-8'),
          contentType: 'text/html; charset=utf-8',
        },
      ],
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
