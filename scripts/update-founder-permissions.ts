import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Users to update with founder permissions and expenses access
const FOUNDERS = [
  { name: 'Kyle', email: 'kyle@47industries.com' },
  { name: 'Dean', email: 'dean@47industries.com' },
  { name: 'Wesley', email: 'wesley@47industries.com' },
  { name: 'Dylan', email: 'dylan@47industries.com' },
]

const TEST_USER = { name: 'Test User', email: 'test@47industries.com' }

async function main() {
  console.log('Updating founder permissions...\n')

  // Update founders
  for (const founder of FOUNDERS) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: founder.email },
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

      console.log(`✅ ${user.name || user.email} - isFounder: true, permissions: ${JSON.stringify(permissions)}`)
    } else {
      console.log(`⚠️  ${founder.name} (${founder.email}) - User not found`)
    }
  }

  // Update test user (expenses access but not a founder)
  const testUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: TEST_USER.email },
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

    console.log(`✅ ${testUser.name || testUser.email} - permissions: ${JSON.stringify(permissions)} (not a founder)`)
  } else {
    console.log(`⚠️  Test User - not found`)
  }

  console.log('\n--- Summary ---')

  // Show all founders
  const allFounders = await prisma.user.findMany({
    where: { isFounder: true },
    select: { id: true, name: true, email: true, permissions: true }
  })

  console.log(`\nFounders (${allFounders.length}):`)
  for (const f of allFounders) {
    console.log(`  - ${f.name || f.email}`)
  }

  // Show users with expenses permission
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

  console.log(`\nUsers with expenses permission (${expensesUsers.length}):`)
  for (const u of expensesUsers) {
    console.log(`  - ${u.name || u.email} ${u.isFounder ? '(founder)' : ''}`)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
