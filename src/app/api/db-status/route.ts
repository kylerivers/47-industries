import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== 'setup47industries') {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const prisma = new PrismaClient()

  try {
    // Try to connect and count users
    await prisma.$connect()
    const userCount = await prisma.user.count()
    const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()`

    return NextResponse.json({
      status: 'connected',
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'), // Hide password
      userCount,
      tables: tableCount,
      message: 'Database is accessible'
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'),
      error: error.message,
      code: error.code
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
