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
    const { source, amount, category, date, notes, createdBy } = body

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
        createdBy: createdBy || undefined,
      },
    })

    return NextResponse.json({ income })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 })
  }
}
