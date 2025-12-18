import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Test Gmail connection
export async function GET(request: NextRequest) {
  const results: any = {
    hasClientId: !!process.env.GMAIL_CLIENT_ID,
    hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
    hasRefreshToken: !!process.env.GMAIL_REFRESH_TOKEN,
    clientIdPrefix: process.env.GMAIL_CLIENT_ID?.substring(0, 20) + '...',
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'Missing Gmail credentials',
      ...results
    })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://47industries.com/api/oauth/gmail/callback'
    )

    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })

    // Try to get access token
    const tokens = await oauth2Client.getAccessToken()
    results.gotAccessToken = !!tokens.token
    results.accessTokenPrefix = tokens.token?.substring(0, 20) + '...'

    // Try to make a simple Gmail API call
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Get user profile
    const profile = await gmail.users.getProfile({ userId: 'me' })
    results.email = profile.data.emailAddress
    results.messagesTotal = profile.data.messagesTotal
    results.threadsTotal = profile.data.threadsTotal

    // Try a simple search
    const searchResult = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
      q: 'newer_than:7d'
    })
    results.recentEmailCount = searchResult.data.messages?.length || 0

    // Try the bill search query
    const billQuery = '(from:duke-energy.com OR from:chase.com OR subject:"bill is ready" OR subject:"payment due") newer_than:30d'
    const billSearch = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: billQuery
    })
    results.billEmailCount = billSearch.data.messages?.length || 0
    results.billSearchQuery = billQuery

    return NextResponse.json({
      success: true,
      ...results
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorDetails: error.response?.data,
      ...results
    })
  }
}
