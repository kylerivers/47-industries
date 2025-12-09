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
    const { source, amount, category, date, notes } = body

    if (!source || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Source, amount, category, and date are required' },
        { status: 400 }
      )
    }

    const income = await prisma.financeIncome.create({
      data: {
        source,
        amount,
        category,
        date: new Date(date),
        notes,
        createdBy: session.user?.email || undefined,
      },
    })

    return NextResponse.json({ income })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 })
  }
}
