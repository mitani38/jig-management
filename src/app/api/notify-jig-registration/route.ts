import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import QRCode from 'qrcode'

const resend = new Resend(process.env.RESEND_API_KEY)

const TO = 'deki@mitanigoukin.co.jp'
const CC = 'yuichiro-mitani@mitanigoukin.co.jp'

export async function POST(req: NextRequest) {
  const jig = await req.json()

  const qrDataUrl = await QRCode.toDataURL(jig.jig_id, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const qrBuffer = await QRCode.toBuffer(jig.jig_id, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

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

  const { error } = await resend.emails.send({
    from: '治具管理システム <onboarding@resend.dev>',
    to: [TO],
    cc: [CC],
    subject,
    html,
    attachments: [
      {
        filename: `QRラベル_${jig.jig_id}.png`,
        content: qrBuffer,
        contentType: 'image/png',
      },
    ],
  })

  if (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
