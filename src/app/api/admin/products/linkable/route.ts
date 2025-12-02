import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/products/linkable?productType=DIGITAL - Get products available for linking
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productType = searchParams.get('productType') as 'PHYSICAL' | 'DIGITAL' | null
    const search = searchParams.get('search') || ''

    if (!productType || !['PHYSICAL', 'DIGITAL'].includes(productType)) {
      return NextResponse.json({ error: 'Valid productType is required (PHYSICAL or DIGITAL)' }, { status: 400 })
    }

    // Get the opposite type (we want to link physical to digital and vice versa)
    const targetType = productType === 'PHYSICAL' ? 'DIGITAL' : 'PHYSICAL'

    // Find products of the opposite type that don't have a link yet
    const products = await prisma.product.findMany({
      where: {
        productType: targetType,
        linkedProductId: null,
        active: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } }
          ]
        })
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        productType: true,
        sku: true,
        images: true,
      },
      orderBy: { name: 'asc' },
      take: 50 // Limit results
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching linkable products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
