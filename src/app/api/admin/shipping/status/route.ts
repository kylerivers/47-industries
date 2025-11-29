import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isShippoConfigured } from '@/lib/shippo'

// GET /api/admin/shipping/status - Check Shippo configuration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      configured: isShippoConfigured,
    })
  } catch (error) {
    console.error('Error checking Shippo status:', error)
    return NextResponse.json(
      { error: 'Failed to check Shippo status', configured: false },
      { status: 500 }
    )
  }
}
