import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM

    let startDate: Date
    let endDate: Date

    if (month) {
      const [year, monthNum] = month.split('-').map(Number)
      startDate = new Date(year, monthNum - 1, 1)
      endDate = new Date(year, monthNum, 0, 23, 59, 59)
    } else {
      // Default to current month
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    const [expenses, income] = await Promise.all([
      prisma.financeExpense.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.financeIncome.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      }),
    ])

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0)

    return NextResponse.json({
      expenses,
      income,
      totals: {
        expenses: totalExpenses,
        income: totalIncome,
        net: totalIncome - totalExpenses,
      },
    })
  } catch (error) {
    console.error('Error fetching finances:', error)
    return NextResponse.json({ error: 'Failed to fetch finances' }, { status: 500 })
  }
}
