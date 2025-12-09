import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// PATCH /api/admin/products/option-types/[id] - Update an option type
export async function PATCH(
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

    const optionType = await prisma.productOptionType.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.values && { values: body.values }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    })

    return NextResponse.json(optionType)
  } catch (error) {
    console.error('Error updating option type:', error)
    return NextResponse.json(
      { error: 'Failed to update option type' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/option-types/[id] - Delete an option type
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

    await prisma.productOptionType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting option type:', error)
    return NextResponse.json(
      { error: 'Failed to delete option type' },
      { status: 500 }
    )
  }
}
