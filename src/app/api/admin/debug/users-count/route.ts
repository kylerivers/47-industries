import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Quick debug endpoint to check user counts
export async function GET(req: NextRequest) {
  try {
    const totalUsers = await prisma.user.count()
    const customers = await prisma.user.count({ where: { role: 'CUSTOMER' } })
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    const superAdmins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })

    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      counts: {
        total: totalUsers,
        customers,
        admins,
        superAdmins,
      },
      sampleUsers,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
