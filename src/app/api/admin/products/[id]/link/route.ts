import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// POST /api/admin/products/[id]/link - Link to an existing product
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminAuth(req)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { linkedProductId } = body

    if (!linkedProductId) {
      return NextResponse.json({ error: 'linkedProductId is required' }, { status: 400 })
    }

    // Get both products
    const [sourceProduct, targetProduct] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      prisma.product.findUnique({ where: { id: linkedProductId } })
    ])

    if (!sourceProduct) {
      return NextResponse.json({ error: 'Source product not found' }, { status: 404 })
    }

    if (!targetProduct) {
      return NextResponse.json({ error: 'Target product not found' }, { status: 404 })
    }

    // Validate: can only link physical to digital or digital to physical
    if (sourceProduct.productType === targetProduct.productType) {
      return NextResponse.json({
        error: `Cannot link two ${sourceProduct.productType.toLowerCase()} products. Must link physical to digital or vice versa.`
      }, { status: 400 })
    }

    // Check if source already has a link
    if (sourceProduct.linkedProductId) {
      return NextResponse.json({
        error: 'This product already has a linked product. Unlink it first.'
      }, { status: 400 })
    }

    // Check if target already has a link
    if (targetProduct.linkedProductId) {
      return NextResponse.json({
        error: 'The target product already has a linked product. Unlink it first.'
      }, { status: 400 })
    }

    // Create bidirectional link
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { linkedProductId }
      }),
      prisma.product.update({
        where: { id: linkedProductId },
        data: { linkedProductId: id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Products linked successfully'
    })
  } catch (error) {
    console.error('Error linking products:', error)
    return NextResponse.json({ error: 'Failed to link products' }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]/link - Unlink the current linked product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminAuth(req)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the product and its linked product
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, linkedProductId: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.linkedProductId) {
      return NextResponse.json({ error: 'Product has no linked product' }, { status: 400 })
    }

    // Remove bidirectional link
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { linkedProductId: null }
      }),
      prisma.product.update({
        where: { id: product.linkedProductId },
        data: { linkedProductId: null }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Products unlinked successfully'
    })
  } catch (error) {
    console.error('Error unlinking products:', error)
    return NextResponse.json({ error: 'Failed to unlink products' }, { status: 500 })
  }
}
