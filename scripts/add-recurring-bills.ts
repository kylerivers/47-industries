import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const RECURRING_BILLS = [
  {
    name: 'Rent',
    vendor: 'Rent',
    vendorType: 'RENT',
    amountType: 'FIXED',
    fixedAmount: 3000,
    frequency: 'MONTHLY',
    dueDay: 1,
    emailPatterns: ['zelle', 'rent'],
    paymentMethod: 'Zelle',
  },
  {
    name: 'Duke Energy',
    vendor: 'Duke Energy',
    vendorType: 'UTILITY',
    amountType: 'VARIABLE',
    fixedAmount: null,
    frequency: 'MONTHLY',
    dueDay: 17,
    emailPatterns: ['duke', 'energy'],
    paymentMethod: 'Autopay',
  },
  {
    name: 'Water',
    vendor: 'Pinellas County Utilities',
    vendorType: 'UTILITY',
    amountType: 'VARIABLE',
    fixedAmount: null,
    frequency: 'QUARTERLY',
    dueDay: 23,
    emailPatterns: ['pinellas', 'water', 'utilities'],
    paymentMethod: 'Manual',
  },
  {
    name: 'Chase Credit Card',
    vendor: 'Chase',
    vendorType: 'CREDIT_CARD',
    amountType: 'VARIABLE',
    fixedAmount: null,
    frequency: 'MONTHLY',
    dueDay: 8,
    emailPatterns: ['chase', 'statement', 'payment due'],
    paymentMethod: 'Autopay',
  },
  {
    name: 'American Express',
    vendor: 'American Express',
    vendorType: 'CREDIT_CARD',
    amountType: 'VARIABLE',
    fixedAmount: null,
    frequency: 'MONTHLY',
    dueDay: 20,
    emailPatterns: ['american express', 'amex', 'statement'],
    paymentMethod: 'Autopay',
  },
  {
    name: 'Trash',
    vendor: 'Tote Enterprises',
    vendorType: 'UTILITY',
    amountType: 'FIXED',
    fixedAmount: 27,
    frequency: 'MONTHLY',
    dueDay: 1,
    emailPatterns: ['tote', 'trash', 'waste'],
    paymentMethod: 'Manual',
  },
  {
    name: 'Frontier Wi-Fi',
    vendor: 'Frontier',
    vendorType: 'UTILITY',
    amountType: 'FIXED',
    fixedAmount: 95.69,
    frequency: 'MONTHLY',
    dueDay: 5,
    emailPatterns: ['frontier', 'wifi', 'internet'],
    paymentMethod: 'Autopay',
  },
]

async function main() {
  console.log('Adding recurring bills...\n')

  for (const bill of RECURRING_BILLS) {
    // Check if already exists
    const existing = await prisma.recurringBill.findFirst({
      where: { name: bill.name }
    })

    if (existing) {
      console.log(`⚠️  ${bill.name} already exists, skipping...`)
      continue
    }

    await prisma.recurringBill.create({
      data: {
        name: bill.name,
        vendor: bill.vendor,
        vendorType: bill.vendorType,
        amountType: bill.amountType,
        fixedAmount: bill.fixedAmount,
        frequency: bill.frequency,
        dueDay: bill.dueDay,
        emailPatterns: bill.emailPatterns,
        paymentMethod: bill.paymentMethod,
        active: true,
      }
    })

    const amountStr = bill.amountType === 'FIXED'
      ? `$${bill.fixedAmount}`
      : 'Variable'

    console.log(`✅ ${bill.name} - ${amountStr} due ${bill.dueDay}${getOrdinalSuffix(bill.dueDay)} (${bill.frequency})`)
  }

  // Also create the water bill instance for this quarter since it's due Dec 23
  const waterBill = await prisma.recurringBill.findFirst({
    where: { name: 'Water' }
  })

  if (waterBill) {
    const existingInstance = await prisma.billInstance.findFirst({
      where: {
        recurringBillId: waterBill.id,
        period: '2024-Q4'
      }
    })

    if (!existingInstance) {
      // Get founders
      const founders = await prisma.user.findMany({
        where: { isFounder: true },
        select: { id: true }
      })

      const amount = 265.16
      const perPersonAmount = founders.length > 0 ? amount / founders.length : amount

      await prisma.billInstance.create({
        data: {
          recurringBillId: waterBill.id,
          vendor: 'Pinellas County Utilities',
          vendorType: 'UTILITY',
          amount,
          dueDate: new Date('2024-12-23'),
          period: '2024-Q4',
          status: 'PENDING',
          founderPayments: {
            create: founders.map(founder => ({
              userId: founder.id,
              amount: perPersonAmount,
              status: 'PENDING'
            }))
          }
        }
      })

      console.log(`\n✅ Created Water bill instance for Q4 2024 - $${amount} due Dec 23`)
    }
  }

  console.log('\n--- Summary ---')
  const allBills = await prisma.recurringBill.findMany({
    where: { active: true },
    orderBy: { dueDay: 'asc' }
  })

  console.log(`\nActive Recurring Bills (${allBills.length}):`)
  for (const b of allBills) {
    const amountStr = b.amountType === 'FIXED'
      ? `$${b.fixedAmount}`
      : 'Variable'
    console.log(`  ${b.dueDay}${getOrdinalSuffix(b.dueDay)}: ${b.name} (${b.vendor}) - ${amountStr}`)
  }
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
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
