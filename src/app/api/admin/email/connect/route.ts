import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { getZohoAuthUrl } from '@/lib/zoho'

// GET /api/admin/email/connect - Get Zoho OAuth URL
export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authUrl = getZohoAuthUrl(session.user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Zoho auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
