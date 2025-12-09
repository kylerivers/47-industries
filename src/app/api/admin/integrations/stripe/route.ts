import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'


// GET /api/admin/integrations/stripe - Check Stripe configuration status
export async function GET() {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configured = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

    return NextResponse.json({
      configured,
    })
  } catch (error) {
    console.error('Error checking Stripe status:', error)
    return NextResponse.json(
      { error: 'Failed to check Stripe status', configured: false },
      { status: 500 }
    )
  }
}
