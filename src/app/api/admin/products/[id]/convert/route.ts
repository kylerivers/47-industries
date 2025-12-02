import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/products/[id]/convert - Create digital or physical version of a product
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { targetType, customPrice } = body // 'DIGITAL' or 'PHYSICAL', optional custom price

    if (!targetType || !['DIGITAL', 'PHYSICAL'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
    }

    // Get the source product
    const sourceProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!sourceProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if converting to the same type
    if (sourceProduct.productType === targetType) {
      return NextResponse.json({ error: `Product is already ${targetType}` }, { status: 400 })
    }

    // Check if already linked to another product
    if (sourceProduct.linkedProductId) {
      return NextResponse.json({
        error: `Product already has a linked ${targetType.toLowerCase()} version`,
        existingProductId: sourceProduct.linkedProductId
      }, { status: 400 })
    }

    // Find or create the target category (same name but different product type)
    let targetCategory = await prisma.category.findFirst({
      where: {
        name: sourceProduct.category.name,
        productType: targetType
      }
    })

    if (!targetCategory) {
      // Create the category for the target type
      const baseSlug = sourceProduct.category.slug.replace('-digital', '')
      targetCategory = await prisma.category.create({
        data: {
          name: sourceProduct.category.name,
          slug: targetType === 'DIGITAL' ? `${baseSlug}-digital` : `${baseSlug}-physical-new`,
          description: sourceProduct.category.description,
          productType: targetType,
          active: true,
        }
      })
    }

    // Get the digital price percentage from settings (default 25%)
    const digitalPriceSetting = await prisma.setting.findUnique({
      where: { key: 'digital_price_percentage' }
    })
    const digitalPricePercentage = digitalPriceSetting ? parseFloat(digitalPriceSetting.value) : 25

    // Calculate price: digital = X% of physical, physical = inverse
    const sourcePrice = Number(sourceProduct.price)
    let newPrice: number

    // Use custom price if provided, otherwise calculate based on percentage
    if (customPrice && customPrice > 0) {
      newPrice = customPrice
    } else if (targetType === 'DIGITAL') {
      // Converting to digital: X% of physical price
      newPrice = Math.round(sourcePrice * (digitalPricePercentage / 100) * 100) / 100
    } else {
      // Converting to physical: inverse (divide by percentage)
      newPrice = Math.round(sourcePrice / (digitalPricePercentage / 100) * 100) / 100
    }

    // Generate new slug and SKU
    const baseSlug = sourceProduct.slug.replace('-stl', '')
    const newSlug = targetType === 'DIGITAL' ? `${baseSlug}-stl` : baseSlug

    const baseSku = sourceProduct.sku?.replace('STL-', '').replace('-STL', '') || ''
    const newSku = targetType === 'DIGITAL' && baseSku ? `STL-${baseSku}` : baseSku || null

    // Check if product with this slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: newSlug }
    })

    if (existingProduct) {
      return NextResponse.json({
        error: `A ${targetType.toLowerCase()} version already exists`,
        existingProductId: existingProduct.id
      }, { status: 400 })
    }

    // Check if SKU already exists (only if we have a SKU to check)
    if (newSku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: newSku }
      })
      if (existingSku) {
        return NextResponse.json({
          error: `SKU ${newSku} already exists`,
        }, { status: 400 })
      }
    }

    // Modify name and description based on target type
    let newName = sourceProduct.name
    let newShortDesc = sourceProduct.shortDesc

    if (targetType === 'DIGITAL') {
      // Converting to digital
      newName = `${sourceProduct.name} STL File`
      newShortDesc = `STL file for 3D printing - ${sourceProduct.shortDesc || sourceProduct.name}`
    } else {
      // Converting to physical
      newName = sourceProduct.name.replace(' STL File', '').replace(' - STL', '')
      newShortDesc = sourceProduct.shortDesc?.replace('STL file for 3D printing - ', '') || null
    }

    // Create the new product with link back to source
    const newProduct = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        description: sourceProduct.description, // Keep description clean, no cross-links
        shortDesc: newShortDesc,
        price: newPrice,
        images: sourceProduct.images as string[],
        categoryId: targetCategory.id,
        stock: targetType === 'DIGITAL' ? 9999 : 0,
        sku: newSku,
        tags: targetType === 'DIGITAL'
          ? ['stl', 'digital download', '3d print', 'print at home']
          : (sourceProduct.tags as string[] || []).filter((t: string) => !['stl', 'digital download', '3d print', 'print at home'].includes(t)),
        featured: false,
        active: true,
        productType: targetType,
        requiresShipping: targetType === 'PHYSICAL',
        linkedProductId: id, // Link to source product
        // Digital-specific fields
        downloadLimit: targetType === 'DIGITAL' ? 10 : null,
        downloadExpiry: targetType === 'DIGITAL' ? 365 : null,
        // Physical-specific fields (copy from source if converting to physical)
        weight: targetType === 'PHYSICAL' ? sourceProduct.weight : null,
        dimensions: targetType === 'PHYSICAL' ? sourceProduct.dimensions : null,
        material: targetType === 'PHYSICAL' ? sourceProduct.material : null,
        printTime: targetType === 'PHYSICAL' ? sourceProduct.printTime : null,
        layerHeight: targetType === 'PHYSICAL' ? sourceProduct.layerHeight : null,
        infill: targetType === 'PHYSICAL' ? sourceProduct.infill : null,
      }
    })

    // Update source product to link to new product
    await prisma.product.update({
      where: { id },
      data: { linkedProductId: newProduct.id }
    })

    return NextResponse.json({
      success: true,
      product: newProduct,
      suggestedPrice: newPrice,
      message: `Created ${targetType.toLowerCase()} version at $${newPrice.toFixed(2)}`
    })
  } catch (error) {
    console.error('Error converting product:', error)
    return NextResponse.json({ error: 'Failed to convert product' }, { status: 500 })
  }
}
