import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const billNotifierUrl = process.env.BILL_NOTIFIER_URL
    const apiKey = process.env.BILL_NOTIFIER_API_KEY

    if (!billNotifierUrl || !apiKey) {
      return NextResponse.json({ recipients: [] })
    }

    const res = await fetch(`${billNotifierUrl}/api/recipients`, {
      headers: {
        'X-API-Key': apiKey
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch recipients')
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ recipients: [] })
  }
}
