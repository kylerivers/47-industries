import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  }

  return NextResponse.json(envCheck)
}
