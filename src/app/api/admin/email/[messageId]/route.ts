import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthInfo } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'
import { ZohoMailClient, refreshAccessToken } from '@/lib/zoho'

// Helper to get a valid access token
async function getValidAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      zohoAccessToken: true,
      zohoRefreshToken: true,
      zohoTokenExpiry: true,
    },
  })

  if (!user?.zohoAccessToken || !user?.zohoRefreshToken) {
    return null
  }

  const isExpired = user.zohoTokenExpiry
    ? new Date(user.zohoTokenExpiry).getTime() < Date.now() + 5 * 60 * 1000
    : true

  if (isExpired) {
    try {
      const tokens = await refreshAccessToken(user.zohoRefreshToken)

      await prisma.user.update({
        where: { id: userId },
        data: {
          zohoAccessToken: tokens.access_token,
          zohoTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
      })

      return tokens.access_token
    } catch (error) {
      console.error('Failed to refresh Zoho token:', error)
      return null
    }
  }

  return user.zohoAccessToken
}

// GET /api/admin/email/[messageId] - Get full email content
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const auth = await getAdminAuthInfo(req)

    if (!auth.isAuthorized || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getValidAccessToken(auth.userId)

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Zoho Mail not connected', needsAuth: true },
        { status: 401 }
      )
    }

    const { messageId } = await params
    const client = new ZohoMailClient(accessToken)

    // Get email content (HTML body)
    const rawContent = await client.getEmailContent(messageId)

    console.log('Zoho raw content type:', typeof rawContent)
    console.log('Zoho raw content keys:', rawContent ? Object.keys(rawContent) : 'null')
    console.log('Zoho raw content sample:', typeof rawContent === 'string'
      ? rawContent.substring(0, 200)
      : JSON.stringify(rawContent).substring(0, 500))

    // Return the raw content - let client handle extraction
    // Zoho returns { content: "html..." } typically
    return NextResponse.json({ content: rawContent })
  } catch (error) {
    console.error('Error fetching email content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email content' },
      { status: 500 }
    )
  }
}
