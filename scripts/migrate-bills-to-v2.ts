// Migration script: Migrate old Bill/BillPayment to new RecurringBill/BillInstance/FounderPayment
// Run with: npx tsx scripts/migrate-bills-to-v2.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting bill migration to v2 schema...\n')

  // Get all founders
  const founders = await prisma.user.findMany({
    where: { isFounder: true },
    select: { id: true, name: true, email: true }
  })
  console.log(`Found ${founders.length} founders:`, founders.map(f => f.name || f.email).join(', '))

  // Get all old bills
  const oldBills = await prisma.bill.findMany({
    include: {
      payments: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  console.log(`\nFound ${oldBills.length} bills to migrate\n`)

  // Create a map of vendor -> recurring bill pattern
  const vendorPatterns: Record<string, { name: string; vendorType: string; patterns: string[] }> = {
    'Duke Energy': { name: 'Electric', vendorType: 'UTILITY', patterns: ['duke', 'energy'] },
    'Chase': { name: 'Chase Card', vendorType: 'CREDIT_CARD', patterns: ['chase', 'statement'] },
    'American Express': { name: 'Amex Card', vendorType: 'CREDIT_CARD', patterns: ['amex', 'americanexpress'] },
    'Pinellas County': { name: 'Water', vendorType: 'UTILITY', patterns: ['pinellas', 'water'] },
    'Tote': { name: 'Trash', vendorType: 'UTILITY', patterns: ['tote', 'trash'] },
    'Bank of America': { name: 'BoA Alerts', vendorType: 'CREDIT_CARD', patterns: ['bankofamerica', 'boa'] },
    'Spectrum': { name: 'Internet', vendorType: 'UTILITY', patterns: ['spectrum', 'internet'] },
    'Monique': { name: 'Rent', vendorType: 'RENT', patterns: ['zelle', 'monique'] },
  }

  // Create recurring bills for known vendors
  console.log('Creating recurring bill definitions...\n')
  const createdRecurringBills: Record<string, string> = {}

  for (const [vendorKey, config] of Object.entries(vendorPatterns)) {
    // Check if recurring bill already exists
    const existing = await prisma.recurringBill.findFirst({
      where: { vendor: { contains: vendorKey.split(' ')[0] } }
    })

    if (existing) {
      console.log(`  Recurring bill exists: ${config.name}`)
      createdRecurringBills[vendorKey] = existing.id
      continue
    }

    // Determine if fixed or variable based on vendor type
    const isFixed = config.vendorType === 'RENT'

    const recurringBill = await prisma.recurringBill.create({
      data: {
        name: config.name,
        vendor: vendorKey,
        amountType: isFixed ? 'FIXED' : 'VARIABLE',
        fixedAmount: isFixed ? 3000 : null, // Rent is $3000
        frequency: 'MONTHLY',
        dueDay: 15, // Default to 15th, can adjust later
        emailPatterns: config.patterns,
        vendorType: config.vendorType,
        active: true
      }
    })
    console.log(`  Created recurring bill: ${config.name} (${recurringBill.id})`)
    createdRecurringBills[vendorKey] = recurringBill.id
  }

  // Migrate old bills to bill instances
  console.log('\n\nMigrating bills to instances...\n')
  let migrated = 0
  let skipped = 0

  for (const oldBill of oldBills) {
    // Check if already migrated (by email ID)
    if (oldBill.emailId) {
      const existing = await prisma.billInstance.findFirst({
        where: { emailId: oldBill.emailId }
      })
      if (existing) {
        console.log(`  Skipped (already migrated): ${oldBill.vendor} - ${oldBill.emailId.substring(0, 20)}...`)
        skipped++
        continue
      }
    }

    // Find matching recurring bill
    let recurringBillId: string | null = null
    for (const [vendorKey, rbId] of Object.entries(createdRecurringBills)) {
      if (oldBill.vendor.toLowerCase().includes(vendorKey.toLowerCase().split(' ')[0])) {
        recurringBillId = rbId
        break
      }
    }

    // Determine period from due date or created date
    const billDate = oldBill.dueDate || oldBill.createdAt
    const period = billDate.toISOString().slice(0, 7) // YYYY-MM

    // Create bill instance
    const billInstance = await prisma.billInstance.create({
      data: {
        recurringBillId,
        vendor: oldBill.vendor,
        vendorType: oldBill.vendorType,
        amount: oldBill.amount,
        dueDate: oldBill.dueDate || oldBill.createdAt,
        period,
        status: oldBill.status,
        paidDate: oldBill.paidDate,
        paidVia: oldBill.paidDate ? 'Migrated from old system' : null,
        emailId: oldBill.emailId,
        emailSubject: oldBill.emailSubject,
        emailFrom: oldBill.emailFrom
      }
    })

    // Migrate payments to founder payments
    const founderCount = founders.length
    const perPersonAmount = Number(oldBill.amount) / founderCount

    // If old payments exist, migrate them
    if (oldBill.payments.length > 0) {
      for (const oldPayment of oldBill.payments) {
        await prisma.founderPayment.create({
          data: {
            billInstanceId: billInstance.id,
            userId: oldPayment.userId,
            amount: oldPayment.amount,
            status: oldPayment.status,
            paidDate: oldPayment.paidDate
          }
        })
      }
    } else {
      // Create founder payments for all founders
      for (const founder of founders) {
        await prisma.founderPayment.create({
          data: {
            billInstanceId: billInstance.id,
            userId: founder.id,
            amount: perPersonAmount,
            status: oldBill.status === 'PAID' ? 'PAID' : 'PENDING',
            paidDate: oldBill.status === 'PAID' ? oldBill.paidDate : null
          }
        })
      }
    }

    console.log(`  Migrated: ${oldBill.vendor} - $${oldBill.amount} (${period})`)
    migrated++
  }

  console.log('\n\n========== Migration Complete ==========')
  console.log(`Migrated: ${migrated} bills`)
  console.log(`Skipped (duplicates): ${skipped} bills`)
  console.log(`Recurring bills created: ${Object.keys(createdRecurringBills).length}`)

  // Print summary of recurring bills
  console.log('\n\nRecurring Bills:')
  const recurringBills = await prisma.recurringBill.findMany({
    include: { _count: { select: { instances: true } } }
  })
  for (const rb of recurringBills) {
    console.log(`  ${rb.name}: ${rb._count.instances} instances`)
  }

  // Print current month summary
  const currentPeriod = new Date().toISOString().slice(0, 7)
  const currentMonthInstances = await prisma.billInstance.count({
    where: { period: currentPeriod }
  })
  console.log(`\nCurrent month (${currentPeriod}): ${currentMonthInstances} bills`)

  console.log('\n========================================')
  console.log('Migration successful!')
  console.log('\nNext steps:')
  console.log('1. Review recurring bills and adjust due days')
  console.log('2. Set correct fixed amounts for FIXED bills')
  console.log('3. Update email patterns if needed')
  console.log('4. Test the new expenses screen in the mobile app')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
