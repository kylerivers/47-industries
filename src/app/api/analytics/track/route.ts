import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Cache for IP geolocation to avoid excessive API calls
const geoCache = new Map<string, { data: GeoData; timestamp: number }>()
const GEO_CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface GeoData {
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

// Get geolocation from IP using free ip-api.com service
async function getGeoFromIP(ip: string | null): Promise<GeoData> {
  const nullGeo: GeoData = {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null
  }

  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return nullGeo
  }

  // Check cache first
  const cached = geoCache.get(ip)
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.data
  }

  try {
    // Using ip-api.com (free, no API key needed, 45 requests/minute limit)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })

    if (!response.ok) return nullGeo

    const data = await response.json()

    if (data.status !== 'success') return nullGeo

    const geoData: GeoData = {
      country: data.country || null,
      countryCode: data.countryCode || null,
      region: data.regionName || null,
      city: data.city || null,
      latitude: data.lat || null,
      longitude: data.lon || null
    }

    // Cache the result
    geoCache.set(ip, { data: geoData, timestamp: Date.now() })

    return geoData
  } catch (error) {
    // Silently fail - geo is optional
    return nullGeo
  }
}

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

    // Get geolocation from IP (async, won't block if slow)
    const geo = await getGeoFromIP(ip)

    // Update or create active session with geo data
    await prisma.activeSession.upsert({
      where: { sessionId },
      update: {
        lastActive: new Date(),
        currentPage: path,
        ip,
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude
      },
      create: {
        sessionId,
        visitorId,
        currentPage: path,
        ip,
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude
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
