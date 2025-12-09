import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'


// GET /api/admin/integrations/r2 - Check Cloudflare R2 configuration status
export async function GET() {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configured = !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
    )

    return NextResponse.json({
      configured,
    })
  } catch (error) {
    console.error('Error checking R2 status:', error)
    return NextResponse.json(
      { error: 'Failed to check R2 status', configured: false },
      { status: 500 }
    )
  }
}
