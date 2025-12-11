import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthInfo } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// GET /api/admin/analytics - Get analytics data
export async function GET(req: NextRequest) {
  try {
    const auth = await getAdminAuthInfo(req)
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    // Support both 'period' and 'range' query params for compatibility
    const period = searchParams.get('period') || searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let periodDays: number

    switch (period) {
      case '24h':
        periodDays = 1
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        break
      case '7d':
        periodDays = 7
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        periodDays = 30
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        periodDays = 90
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      default:
        periodDays = 7
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    }

    // Clean up stale sessions
    const cutoffTime = new Date(now.getTime() - 45 * 1000)
    await prisma.activeSession.deleteMany({
      where: { lastActive: { lt: cutoffTime } }
    })

    // Get active sessions
    const activeSessions = await prisma.activeSession.findMany({
      where: { lastActive: { gte: cutoffTime } },
      select: {
        id: true,
        sessionId: true,
        currentPage: true,
        lastActive: true,
        country: true,
        countryCode: true,
        region: true,
        city: true,
        latitude: true,
        longitude: true
      }
    })

    // Get orders and revenue for current period
    const currentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { total: true, status: true }
    })

    // Get orders and revenue for previous period (for comparison)
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: previousStartDate, lt: startDate }
      },
      select: { total: true }
    })

    const currentRevenue = currentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const currentOrderCount = currentOrders.length
    const previousOrderCount = previousOrders.length

    // Get refunds
    const refundedOrders = currentOrders.filter(o => o.status === 'REFUNDED')
    const refunds = refundedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

    // Get unique visitors
    const currentVisitors = await prisma.pageView.groupBy({
      by: ['visitorId'],
      where: { createdAt: { gte: startDate } }
    })
    const previousVisitors = await prisma.pageView.groupBy({
      by: ['visitorId'],
      where: { createdAt: { gte: previousStartDate, lt: startDate } }
    })

    // Calculate conversion rate
    const currentConversion = currentVisitors.length > 0
      ? (currentOrderCount / currentVisitors.length) * 100
      : 0
    const previousConversion = previousVisitors.length > 0
      ? (previousOrderCount / previousVisitors.length) * 100
      : 0

    // Get total page views
    const totalPageViews = await prisma.pageView.count({
      where: { createdAt: { gte: startDate } }
    })

    // Get top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: startDate } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10
    })

    // Get device stats
    const deviceStats = await prisma.pageView.groupBy({
      by: ['device'],
      where: {
        createdAt: { gte: startDate },
        device: { not: null }
      },
      _count: { device: true }
    })

    const totalDeviceViews = deviceStats.reduce((sum, d) => sum + d._count.device, 0)
    const devices = {
      mobile: 0,
      desktop: 0,
      tablet: 0
    }
    deviceStats.forEach(d => {
      const deviceLower = (d.device || '').toLowerCase()
      const percentage = totalDeviceViews > 0 ? Math.round((d._count.device / totalDeviceViews) * 100) : 0
      if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
        devices.mobile += percentage
      } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
        devices.tablet += percentage
      } else {
        devices.desktop += percentage
      }
    })

    // Get referrer/traffic sources
    const referrerStats = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        createdAt: { gte: startDate },
        referrer: { not: null }
      },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 10
    })

    const totalReferrerViews = referrerStats.reduce((sum, r) => sum + r._count.referrer, 0) || 1
    const trafficSources = referrerStats.map(r => {
      let name = 'Direct'
      try {
        if (r.referrer) {
          name = new URL(r.referrer).hostname
        }
      } catch {
        name = r.referrer || 'Direct'
      }
      const percentage = Math.round((r._count.referrer / totalReferrerViews) * 100)
      return {
        name,
        visitors: r._count.referrer,
        percentage
      }
    })

    // Get top products
    const topProductSales = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { createdAt: { gte: startDate } }
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })

    const productIds = topProductSales.map(p => p.productId).filter(Boolean)
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds as string[] } },
      select: { id: true, name: true }
    }) : []

    const topProducts = topProductSales.map(p => {
      const product = products.find(pr => pr.id === p.productId)
      return {
        name: product?.name || 'Unknown Product',
        sales: p._sum.quantity || 0,
        revenue: Number(p._sum.price || 0)
      }
    })

    // Get page views by day
    const pageViewsByDay = await getPageViewsByDay(startDate, now)

    // Calculate avg order value
    const avgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0

    return NextResponse.json({
      // Data format expected by mobile app
      revenue: {
        current: currentRevenue,
        previous: previousRevenue
      },
      orders: {
        current: currentOrderCount,
        previous: previousOrderCount
      },
      visitors: {
        current: currentVisitors.length,
        previous: previousVisitors.length
      },
      conversionRate: {
        current: currentConversion,
        previous: previousConversion
      },
      avgOrderValue,
      refunds,
      trafficSources,
      topProducts,
      devices,

      // Original data for web admin
      activeUsers: activeSessions.length,
      activeSessions: activeSessions.map(s => ({
        id: s.id,
        currentPage: s.currentPage,
        lastActive: s.lastActive,
        country: s.country,
        countryCode: s.countryCode,
        region: s.region,
        city: s.city,
        latitude: s.latitude,
        longitude: s.longitude
      })),
      totalPageViews,
      uniqueVisitors: currentVisitors.length,
      topPages: topPages.map(p => ({ path: p.path, views: p._count.path })),
      deviceStats: deviceStats.map(d => ({ device: d.device, count: d._count.device })),
      pageViewsByDay,
      period
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getPageViewsByDay(startDate: Date, endDate: Date) {
  const pageViews = await prisma.pageView.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { createdAt: true }
  })

  const byDay: Record<string, number> = {}
  pageViews.forEach(pv => {
    const day = pv.createdAt.toISOString().split('T')[0]
    byDay[day] = (byDay[day] || 0) + 1
  })

  const result: { date: string; views: number }[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    result.push({ date: dateStr, views: byDay[dateStr] || 0 })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}
