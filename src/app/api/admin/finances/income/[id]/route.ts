import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth-helper'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthorized = await verifyAdminAuth(request)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.financeIncome.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 })
  }
}
