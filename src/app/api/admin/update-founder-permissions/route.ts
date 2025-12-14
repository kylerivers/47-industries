import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Users to update with founder permissions and expenses access
const FOUNDERS = [
  { name: 'Kyle', emailPattern: 'kyle' },
  { name: 'Dean', emailPattern: 'dean' },
  { name: 'Wesley', emailPattern: 'wesley' },
  { name: 'Dylan', emailPattern: 'dylan' },
]

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: string[] = []

    // Update founders
    for (const founder of FOUNDERS) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: founder.emailPattern } },
            { name: { contains: founder.name } }
          ]
        }
      })

      if (user) {
        // Get existing permissions or default to empty array
        const existingPermissions = (user.permissions as string[]) || []

        // Ensure 'expenses' permission is included
        const permissions = existingPermissions.includes('expenses')
          ? existingPermissions
          : [...existingPermissions, 'expenses']

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isFounder: true,
            permissions,
          }
        })

        results.push(`✅ ${user.name || user.email} - isFounder: true, permissions: ${JSON.stringify(permissions)}`)
      } else {
        results.push(`⚠️ ${founder.name} - User not found`)
      }
    }

    // Update test user (expenses access but not a founder)
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { name: { contains: 'Test' } },
          { username: { contains: 'test' } }
        ]
      }
    })

    if (testUser) {
      const existingPermissions = (testUser.permissions as string[]) || []
      const permissions = existingPermissions.includes('expenses')
        ? existingPermissions
        : [...existingPermissions, 'expenses']

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          permissions,
        }
      })

      results.push(`✅ ${testUser.name || testUser.email} - permissions: ${JSON.stringify(permissions)} (not a founder)`)
    } else {
      results.push(`⚠️ Test User - not found`)
    }

    // Get summary
    const allFounders = await prisma.user.findMany({
      where: { isFounder: true },
      select: { id: true, name: true, email: true }
    })

    return NextResponse.json({
      success: true,
      results,
      founders: allFounders.map(f => f.name || f.email),
      message: `Updated ${allFounders.length} founders`
    })
  } catch (error: any) {
    console.error('Error updating founder permissions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update permissions' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all founders
    const founders = await prisma.user.findMany({
      where: { isFounder: true },
      select: { id: true, name: true, email: true, permissions: true }
    })

    // Get users with expenses permission
    const usersWithExpenses = await prisma.user.findMany({
      where: {
        permissions: {
          not: null
        }
      },
      select: { id: true, name: true, email: true, permissions: true, isFounder: true }
    })

    const expensesUsers = usersWithExpenses.filter(u =>
      Array.isArray(u.permissions) && (u.permissions as string[]).includes('expenses')
    )

    return NextResponse.json({
      founders: founders.map(f => ({
        name: f.name || f.email,
        permissions: f.permissions
      })),
      usersWithExpenses: expensesUsers.map(u => ({
        name: u.name || u.email,
        isFounder: u.isFounder,
        permissions: u.permissions
      }))
    })
  } catch (error: any) {
    console.error('Error fetching founder permissions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}
