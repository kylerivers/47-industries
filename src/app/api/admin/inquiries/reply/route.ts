import { NextRequest, NextResponse } from 'next/server'
import { sendReplyEmail } from '@/lib/email'

// POST /api/admin/inquiries/reply - Send email reply to inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.to || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'To, subject, and message are required' },
        { status: 400 }
      )
    }

    const result = await sendReplyEmail({
      to: body.to,
      subject: body.subject,
      message: body.message,
      referenceNumber: body.referenceNumber,
      fromAddress: 'contact@47industries.com',
      senderName: '47 Industries',
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending reply email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
