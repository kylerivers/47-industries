import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { vendor, amount, category, date, notes, recurring } = body

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
        createdBy: session.user?.email || undefined,
      },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
