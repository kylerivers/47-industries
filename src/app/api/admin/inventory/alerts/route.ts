import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// GET /api/admin/inventory/alerts - List inventory alerts
export async function GET() {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let alerts: any[] = []

    try {
      alerts = await prisma.inventoryAlert.findMany({
        orderBy: [
          { isResolved: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          product: {
            select: { name: true, stock: true },
          },
        },
      })
    } catch {
      // Model might not exist yet - generate alerts from products
      const LOW_STOCK_THRESHOLD = 10

      const products = await prisma.product.findMany({
        where: {
          active: true,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      })

      // Generate pseudo-alerts from current stock levels
      alerts = products.map(product => ({
        id: `generated-${product.id}`,
        productId: product.id,
        product: { name: product.name, stock: product.stock },
        type: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        threshold: LOW_STOCK_THRESHOLD,
        isResolved: false,
        createdAt: new Date().toISOString(),
      }))
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory alerts' },
      { status: 500 }
    )
  }
}
