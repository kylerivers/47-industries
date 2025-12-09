import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/tax/rates/[id] - Update a tax rate
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const {
      name,
      country,
      state,
      zipCode,
      city,
      rate,
      isCompound,
      includeShipping,
      priority,
      active,
    } = body

    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        name,
        country: country || 'US',
        state: state || null,
        zipCode: zipCode || null,
        city: city || null,
        rate: parseFloat(rate),
        isCompound: isCompound ?? false,
        includeShipping: includeShipping ?? false,
        priority: priority || 0,
        active,
      },
    })

    return NextResponse.json(taxRate)
  } catch (error) {
    console.error('Error updating tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to update tax rate' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tax/rates/[id] - Delete a tax rate
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.taxRate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tax rate:', error)
    return NextResponse.json(
      { error: 'Failed to delete tax rate' },
      { status: 500 }
    )
  }
}
