import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  // Simple protection - only allow if key matches
  if (key !== 'setup47industries') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
  }

  const results: string[] = []

  try {
    results.push('🚀 Starting database setup...')

    // Step 1: Check database connection
    try {
      await prisma.$connect()
      results.push('✅ Database connection successful')
    } catch (error: any) {
      results.push('❌ Database connection failed: ' + error.message)
      return NextResponse.json({ error: 'Database connection failed', results }, { status: 500 })
    }

    // Step 2: Try to create tables (this will fail if they exist, which is fine)
    try {
      // Check if User table exists by trying to count
      await prisma.user.count()
      results.push('✅ Database tables already exist')
    } catch (error) {
      results.push('ℹ️ Database tables might not exist - you may need to run: npx prisma db push')
      results.push('⚠️ Please run "npx prisma db push" in Railway shell to create tables')
    }

    // Step 3: Create or update admin user
    try {
      // Check if admin exists
      let admin = await prisma.user.findFirst({
        where: {
          OR: [
            { email: 'admin@47industries.com' },
            { username: '47industries' },
            { role: 'ADMIN' }
          ]
        }
      })

      const hashedPassword = await bcrypt.hash('Balance47420', 10)

      if (admin) {
        // Update existing admin
        await prisma.user.update({
          where: { id: admin.id },
          data: {
            username: '47industries',
            email: 'admin@47industries.com',
            name: '47 Industries',
            password: hashedPassword,
            role: 'ADMIN'
          }
        })
        results.push('✅ Updated existing admin user')
      } else {
        // Create new admin
        await prisma.user.create({
          data: {
            username: '47industries',
            email: 'admin@47industries.com',
            name: '47 Industries',
            password: hashedPassword,
            role: 'ADMIN'
          }
        })
        results.push('✅ Created new admin user')
      }

      results.push('')
      results.push('🎉 SETUP COMPLETE!')
      results.push('')
      results.push('Login credentials:')
      results.push('  Username: 47industries')
      results.push('  Email: admin@47industries.com')
      results.push('  Password: Balance47420')
      results.push('')
      results.push('🔗 Go to: https://47-industries-production.up.railway.app/admin/login')

      return NextResponse.json({
        success: true,
        message: 'Setup completed successfully!',
        results
      })

    } catch (error: any) {
      results.push('❌ Error creating admin user: ' + error.message)
      return NextResponse.json({
        error: 'Failed to create admin user',
        results,
        details: error.message
      }, { status: 500 })
    }

  } catch (error: any) {
    results.push('❌ Unexpected error: ' + error.message)
    return NextResponse.json({
      error: 'Setup failed',
      results,
      details: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
