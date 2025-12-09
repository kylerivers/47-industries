import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth-helper'

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { vendor, amount, category, date, notes, recurring, createdBy } = body

    if (!vendor || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Vendor, amount, category, and date are required' },
        { status: 400 }
      )
    }

    const expense = await prisma.financeExpense.create({
      data: {
        vendor,
        amount,
        category,
        date: new Date(date),
        notes,
        recurring: recurring || false,
        createdBy: createdBy || undefined,
      },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
