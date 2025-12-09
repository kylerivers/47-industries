import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch stats in parallel
    const [
      totalOrders,
      pendingOrders,
      totalCustomers,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          paymentStatus: 'SUCCEEDED',
        },
        _sum: { total: true },
      }),
    ])

    // Format recent orders
    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || order.user?.name || 'Guest',
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }))

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalRevenue: Number(monthlyRevenue._sum.total || 0),
      recentOrders: formattedOrders,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
