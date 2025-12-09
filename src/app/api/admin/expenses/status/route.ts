import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

export async function GET() {
  const isAuthorized = await verifyAdminAuth(request)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const billNotifierUrl = process.env.BILL_NOTIFIER_URL
    if (!billNotifierUrl) {
      return NextResponse.json({
        status: 'not_configured',
        recipients: 0,
        lastCheck: null
      })
    }

    const res = await fetch(billNotifierUrl, {
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch status')
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      status: 'offline',
      recipients: 0,
      lastCheck: null
    })
  }
}
