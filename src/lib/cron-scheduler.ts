import cron from 'node-cron'
import { gmailScanner } from '@/lib/gmail-scanner'
import { billParser } from '@/lib/bill-parser'
import { pushService } from '@/lib/push-notifications'
import { prisma } from '@/lib/prisma'

let isRunning = false

async function scanBills() {
  if (isRunning) {
    console.log('[CRON] Scan already in progress, skipping...')
    return
  }

  isRunning = true
  console.log(`[CRON] Starting bill scan at ${new Date().toISOString()}`)

  try {
    // Fetch emails from last 24 hours
    const emails = await gmailScanner.fetchFromAllAccounts(1)
    console.log(`[CRON] Found ${emails.length} emails to process`)

    let processed = 0
    let created = 0
    let paid = 0
    let skipped = 0

    for (const email of emails) {
      try {
        // Check if already processed in database
        const alreadyProcessed = await gmailScanner.isEmailProcessed(email.id)
        if (alreadyProcessed) {
          skipped++
          continue
        }

        // Process the email
        const result = await billParser.processEmail(email)
        processed++

        if (result.created) {
          created++

          // Send push notification for new bills
          if (result.action === 'created_new') {
            const billInstance = await prisma.billInstance.findUnique({
              where: { id: result.billId }
            })

            if (billInstance) {
              await pushService.sendBillNotification(
                billInstance.vendor,
                Number(billInstance.amount),
                billInstance.dueDate?.toISOString().split('T')[0] || null
              )
            }
          }
        }

        if (result.action === 'marked_paid') {
          paid++

          // Send push notification for payment confirmations
          const billInstance = await prisma.billInstance.findUnique({
            where: { id: result.billId }
          })

          if (billInstance) {
            await pushService.sendPaymentConfirmation(
              billInstance.vendor,
              Number(billInstance.amount)
            )
          }
        }

        if (result.action === 'not_a_bill' || result.action === 'already_processed') {
          skipped++
        }
      } catch (error: any) {
        console.error(`[CRON] Error processing email ${email.id}:`, error.message)
      }
    }

    // Generate any fixed recurring bills for current period
    await generateFixedBills()

    console.log(`[CRON] Scan complete: processed=${processed}, created=${created}, paid=${paid}, skipped=${skipped}`)
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error.message)
  } finally {
    isRunning = false
  }
}

// Generate bill instances for fixed-amount recurring bills
async function generateFixedBills() {
  const period = new Date().toISOString().slice(0, 7) // YYYY-MM

  // Get all active fixed recurring bills
  const fixedBills = await prisma.recurringBill.findMany({
    where: {
      active: true,
      amountType: 'FIXED'
    }
  })

  const founders = await prisma.user.findMany({
    where: { isFounder: true },
    select: { id: true }
  })

  const founderCount = founders.length

  for (const recurring of fixedBills) {
    // Check if we already have an instance for this period
    const existing = await prisma.billInstance.findFirst({
      where: {
        recurringBillId: recurring.id,
        period
      }
    })

    if (existing) continue

    // Check if it's time to create this bill (within 5 days of due date)
    const now = new Date()
    const dueDate = new Date(now.getFullYear(), now.getMonth(), recurring.dueDay)

    // If due day has passed, it's for next month
    if (dueDate < now && now.getDate() > recurring.dueDay + 5) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }

    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Create bill instance if within 5 days of due date
    if (daysUntilDue <= 5 && daysUntilDue >= -2) {
      const amount = Number(recurring.fixedAmount) || 0
      const perPersonAmount = founderCount > 0 ? amount / founderCount : amount

      await prisma.billInstance.create({
        data: {
          recurringBillId: recurring.id,
          vendor: recurring.vendor,
          vendorType: recurring.vendorType,
          amount,
          dueDate,
          period,
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

      console.log(`[CRON] Generated fixed bill: ${recurring.name} - $${amount}`)

      // Send notification
      await pushService.sendBillNotification(
        recurring.vendor,
        amount,
        dueDate.toISOString().split('T')[0]
      )
    }
  }
}

export function startBillScannerCron() {
  // Check if Gmail is configured
  if (!process.env.GMAIL_REFRESH_TOKEN) {
    console.log('[CRON] Gmail not configured, bill scanner disabled')
    return
  }

  console.log('[CRON] Starting bill scanner cron job (every 15 minutes)')

  // Schedule: every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    scanBills()
  })

  // Run initial scan after 30 seconds (let the server fully start)
  setTimeout(() => {
    console.log('[CRON] Running initial bill scan...')
    scanBills()
  }, 30000)
}
