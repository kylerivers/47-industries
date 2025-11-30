import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Parse user agent for device/browser/os info
function parseUserAgent(ua: string | null) {
  if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' }

  // Device detection
  let device = 'desktop'
  if (/mobile/i.test(ua)) device = 'mobile'
  else if (/tablet|ipad/i.test(ua)) device = 'tablet'

  // Browser detection
  let browser = 'unknown'
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/edge|edg/i.test(ua)) browser = 'Edge'
  else if (/opera|opr/i.test(ua)) browser = 'Opera'

  // OS detection
  let os = 'unknown'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS'

  return { device, browser, os }
}

// POST /api/analytics/track - Track page view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path, visitorId, sessionId, referrer, duration } = body

    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || null

    const { device, browser, os } = parseUserAgent(userAgent)

    // Create or update visitor
    const existingVisitor = await prisma.visitor.findUnique({
      where: { visitorId }
    })

    if (existingVisitor) {
      await prisma.visitor.update({
        where: { visitorId },
        data: {
          lastVisit: new Date(),
          totalVisits: { increment: 1 }
        }
      })
    } else {
      await prisma.visitor.create({
        data: { visitorId }
      })
    }

    // Update or create active session
    await prisma.activeSession.upsert({
      where: { sessionId },
      update: {
        lastActive: new Date(),
        currentPage: path
      },
      create: {
        sessionId,
        visitorId,
        currentPage: path
      }
    })

    // Create page view
    await prisma.pageView.create({
      data: {
        path,
        visitorId,
        sessionId,
        userAgent,
        ip,
        referrer,
        device,
        browser,
        os,
        duration
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics track error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

// Cleanup old sessions (called periodically)
export async function DELETE() {
  try {
    // Remove sessions inactive for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    await prisma.activeSession.deleteMany({
      where: {
        lastActive: { lt: fiveMinutesAgo }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 })
  }
}
