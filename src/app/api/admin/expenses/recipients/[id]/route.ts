import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthorized = await verifyAdminAuth(request)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const billNotifierUrl = process.env.BILL_NOTIFIER_URL
    const apiKey = process.env.BILL_NOTIFIER_API_KEY

    if (!billNotifierUrl || !apiKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    const body = await request.json()

    const res = await fetch(`${billNotifierUrl}/api/recipients/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      throw new Error('Failed to update recipient')
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
