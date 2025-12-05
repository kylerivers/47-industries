import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exchangeCodeForTokens } from '@/lib/zoho'

// Base URL for redirects - use admin subdomain
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://admin.47industries.com'
  : 'http://localhost:3000'

// GET /api/auth/zoho/callback - Handle OAuth callback from Zoho
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.redirect(`${BASE_URL}/login`)
    }

    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Zoho OAuth error:', error)
      return NextResponse.redirect(`${BASE_URL}/settings?error=zoho_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/settings?error=no_code`)
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Store tokens in database for the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        zohoAccessToken: tokens.access_token,
        zohoRefreshToken: tokens.refresh_token,
        zohoTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    })

    return NextResponse.redirect(`${BASE_URL}/email?success=connected`)
  } catch (error) {
    console.error('Error in Zoho OAuth callback:', error)
    return NextResponse.redirect(`${BASE_URL}/settings?error=zoho_auth_failed`)
  }
}
