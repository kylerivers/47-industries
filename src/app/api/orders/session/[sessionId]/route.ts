import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: {
        orderNumber: true,
        customerEmail: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        email: order.customerEmail,
        total: Number(order.total),
        status: order.status.toLowerCase(),
      },
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
