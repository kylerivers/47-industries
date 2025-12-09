import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { isShippoConfigured } from '@/lib/shippo'

// GET /api/admin/shipping/status - Check Shippo configuration status
export async function GET() {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
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
