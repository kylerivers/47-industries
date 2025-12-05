import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts and revenue in parallel
    const [
      ordersCount,
      revenueData,
      customRequestsCount,
      serviceInquiriesCount,
      recentOrders,
      recentRequests,
      recentInquiries,
    ] = await Promise.all([
      // Total orders (not cancelled)
      prisma.order.count({
        where: {
          status: { not: 'CANCELLED' }
        }
      }),
      // Total revenue from paid orders
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'SUCCEEDED'
        }
      }),
      // Custom 3D print requests
      prisma.customRequest.count(),
      // Service inquiries
      prisma.serviceInquiry.count(),
      // Recent orders (last 5)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        }
      }),
      // Recent custom requests (last 5)
      prisma.customRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestNumber: true,
          name: true,
          material: true,
          status: true,
          createdAt: true,
        }
      }),
      // Recent service inquiries (last 5)
      prisma.serviceInquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          inquiryNumber: true,
          name: true,
          serviceType: true,
          status: true,
          createdAt: true,
        }
      }),
    ])

    const revenue = revenueData._sum.total || 0

    // Combine recent activity and sort by date
    const recentActivity = [
      ...recentOrders.map(o => ({
        type: 'order' as const,
        id: o.id,
        number: o.orderNumber,
        name: o.customerName,
        detail: `$${Number(o.total).toFixed(2)}`,
        status: o.status,
        createdAt: o.createdAt,
      })),
      ...recentRequests.map(r => ({
        type: 'request' as const,
        id: r.id,
        number: r.requestNumber,
        name: r.name,
        detail: r.material,
        status: r.status,
        createdAt: r.createdAt,
      })),
      ...recentInquiries.map(i => ({
        type: 'inquiry' as const,
        id: i.id,
        number: i.inquiryNumber,
        name: i.name,
        detail: i.serviceType.replace('_', ' '),
        status: i.status,
        createdAt: i.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

    return NextResponse.json({
      stats: {
        ordersCount,
        revenue: Number(revenue),
        customRequestsCount,
        serviceInquiriesCount,
      },
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
