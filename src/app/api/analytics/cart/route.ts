import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/analytics/cart - Track cart state for abandoned cart detection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { visitorId, sessionId, items, totalValue, email } = body

    if (!visitorId || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If cart is empty, remove any existing abandoned cart record
    if (items.length === 0) {
      await prisma.abandonedCart.deleteMany({
        where: { visitorId, recoveredAt: null }
      })
      return NextResponse.json({ success: true })
    }

    // Upsert abandoned cart (update if exists, create if not)
    await prisma.abandonedCart.upsert({
      where: {
        id: await getExistingCartId(visitorId)
      },
      update: {
        items,
        totalValue: totalValue || 0,
        email,
        sessionId,
        updatedAt: new Date()
      },
      create: {
        visitorId,
        sessionId,
        items,
        totalValue: totalValue || 0,
        email
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart tracking error:', error)
    return NextResponse.json({ error: 'Failed to track cart' }, { status: 500 })
  }
}

// Mark cart as recovered (after successful checkout)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const visitorId = searchParams.get('visitorId')

    if (!visitorId) {
      return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 })
    }

    await prisma.abandonedCart.updateMany({
      where: { visitorId, recoveredAt: null },
      data: { recoveredAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cart recovery error:', error)
    return NextResponse.json({ error: 'Failed to mark cart as recovered' }, { status: 500 })
  }
}

async function getExistingCartId(visitorId: string): Promise<string> {
  const existing = await prisma.abandonedCart.findFirst({
    where: { visitorId, recoveredAt: null },
    select: { id: true }
  })
  return existing?.id || 'new-cart-' + Date.now() // Return fake ID that won't match for upsert to create
}
