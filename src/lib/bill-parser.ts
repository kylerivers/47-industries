import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface ParsedBill {
  vendor: string
  vendorType: string
  amount: number | null
  dueDate: string | null
  isPaid: boolean
  paymentMethod?: string
  confidence: number
}

interface EmailData {
  id: string
  from: string
  subject: string
  body: string
  snippet: string
  date: string
}

export class BillParser {
  async parseEmail(email: EmailData): Promise<ParsedBill | null> {
    // First try to match against recurring bills
    const recurringMatch = await this.matchRecurringBill(email)

    const prompt = `Analyze this email and extract bill/payment information.

FROM: ${email.from}
SUBJECT: ${email.subject}
SNIPPET: ${email.snippet}
BODY (first 2000 chars): ${email.body.substring(0, 2000)}

Determine if this is:
1. A BILL notification (statement ready, payment due, amount owed)
2. A PAYMENT confirmation (payment received, transfer complete, money sent)
3. Neither (promotional, informational, etc.)

Extract:
- vendor: Company/person name (e.g., "Duke Energy", "Chase", "Monique Roberts")
- vendorType: One of: UTILITY, CREDIT_CARD, RENT, SUBSCRIPTION, TRANSFER, OTHER
- amount: Dollar amount if found (number only, no $)
- dueDate: Due date if this is a bill (YYYY-MM-DD format)
- isPaid: true if this is a payment confirmation, false if it's a bill notification
- paymentMethod: How it was paid (e.g., "Zelle", "Autopay", "Bank Transfer") if isPaid is true
- confidence: 0-100 how confident you are this is a real bill/payment

For Zelle transfers:
- The sender (you) sent money TO someone - this is a PAYMENT (isPaid: true)
- Someone sent money TO you - this is income, not a bill

Return JSON only, no explanation:
{"vendor": "", "vendorType": "", "amount": null, "dueDate": null, "isPaid": false, "paymentMethod": null, "confidence": 0}

If this is not a bill or payment, return confidence: 0.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })

      const content = response.content[0]
      if (content.type !== 'text') return null

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      const parsed = JSON.parse(jsonMatch[0]) as ParsedBill

      // Skip low confidence results
      if (parsed.confidence < 50) {
        console.log(`[PARSER] Low confidence (${parsed.confidence}) for: ${email.subject}`)
        return null
      }

      // If we matched a recurring bill, use its details
      if (recurringMatch) {
        parsed.vendor = recurringMatch.vendor
        parsed.vendorType = recurringMatch.vendorType
        if (recurringMatch.amountType === 'FIXED' && recurringMatch.fixedAmount) {
          parsed.amount = Number(recurringMatch.fixedAmount)
        }
      }

      console.log(`[PARSER] Parsed: ${parsed.vendor} - $${parsed.amount} - ${parsed.isPaid ? 'PAID' : 'DUE'}`)
      return parsed
    } catch (error: any) {
      console.error('[PARSER] Error parsing email:', error.message)
      return null
    }
  }

  private async matchRecurringBill(email: EmailData): Promise<any | null> {
    const recurringBills = await prisma.recurringBill.findMany({
      where: { active: true }
    })

    const emailText = `${email.from} ${email.subject} ${email.snippet}`.toLowerCase()

    for (const bill of recurringBills) {
      const patterns = bill.emailPatterns as string[]
      if (!patterns || patterns.length === 0) continue

      const matches = patterns.every(pattern =>
        emailText.includes(pattern.toLowerCase())
      )

      if (matches) {
        console.log(`[PARSER] Matched recurring bill: ${bill.name}`)
        return bill
      }
    }

    return null
  }

  async processEmail(email: EmailData): Promise<{ created: boolean; billId?: string; action?: string }> {
    // Check if already processed
    const existing = await prisma.processedEmail.findUnique({
      where: { emailId: email.id }
    })

    if (existing) {
      return { created: false, action: 'already_processed' }
    }

    // Parse the email
    const parsed = await this.parseEmail(email)
    if (!parsed) {
      await this.markProcessed(email.id, 'skipped')
      return { created: false, action: 'not_a_bill' }
    }

    // Get current period (YYYY-MM)
    const period = new Date().toISOString().slice(0, 7)

    // Get founder count for splitting
    const founderCount = await prisma.user.count({ where: { isFounder: true } })

    if (parsed.isPaid) {
      // This is a payment confirmation - find and update existing bill instance
      const result = await this.handlePaymentConfirmation(email, parsed, period)
      return result
    } else {
      // This is a bill notification - create new bill instance
      const result = await this.handleBillNotification(email, parsed, period, founderCount)
      return result
    }
  }

  private async handlePaymentConfirmation(
    email: EmailData,
    parsed: ParsedBill,
    period: string
  ): Promise<{ created: boolean; billId?: string; action?: string }> {
    // Find existing pending bill instance for this vendor in current period
    const existingBill = await prisma.billInstance.findFirst({
      where: {
        vendor: { contains: parsed.vendor.split(' ')[0] }, // Match first word of vendor
        period,
        status: 'PENDING'
      }
    })

    if (existingBill) {
      // Mark as paid
      await prisma.billInstance.update({
        where: { id: existingBill.id },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          paidVia: parsed.paymentMethod || 'Confirmed via email'
        }
      })

      // Mark all founder payments as paid
      await prisma.founderPayment.updateMany({
        where: { billInstanceId: existingBill.id },
        data: {
          status: 'PAID',
          paidDate: new Date()
        }
      })

      await this.markProcessed(email.id, parsed.vendor, existingBill.id)
      console.log(`[PARSER] Marked bill as paid: ${parsed.vendor}`)
      return { created: false, billId: existingBill.id, action: 'marked_paid' }
    } else {
      // Create a new bill instance marked as already paid
      const billInstance = await this.createBillInstance(email, parsed, period, true)
      return { created: true, billId: billInstance?.id, action: 'created_paid' }
    }
  }

  private async handleBillNotification(
    email: EmailData,
    parsed: ParsedBill,
    period: string,
    founderCount: number
  ): Promise<{ created: boolean; billId?: string; action?: string }> {
    // Check if we already have a bill for this vendor this period
    const existingBill = await prisma.billInstance.findFirst({
      where: {
        vendor: parsed.vendor,
        period,
        emailId: { not: email.id }
      }
    })

    if (existingBill) {
      // Update amount if we now have one
      if (parsed.amount && !existingBill.amount) {
        await prisma.billInstance.update({
          where: { id: existingBill.id },
          data: { amount: parsed.amount }
        })

        // Update founder payment amounts
        if (founderCount > 0) {
          const perPerson = parsed.amount / founderCount
          await prisma.founderPayment.updateMany({
            where: { billInstanceId: existingBill.id },
            data: { amount: perPerson }
          })
        }
      }

      await this.markProcessed(email.id, parsed.vendor, existingBill.id)
      return { created: false, billId: existingBill.id, action: 'updated_existing' }
    }

    // Create new bill instance
    const billInstance = await this.createBillInstance(email, parsed, period, false)
    return { created: true, billId: billInstance?.id, action: 'created_new' }
  }

  private async createBillInstance(
    email: EmailData,
    parsed: ParsedBill,
    period: string,
    isPaid: boolean
  ): Promise<any | null> {
    try {
      // Find matching recurring bill
      const recurringBill = await prisma.recurringBill.findFirst({
        where: {
          vendor: { contains: parsed.vendor.split(' ')[0] },
          active: true
        }
      })

      // Calculate due date
      let dueDate: Date
      if (parsed.dueDate) {
        dueDate = new Date(parsed.dueDate)
      } else if (recurringBill) {
        // Use recurring bill's due day
        const now = new Date()
        dueDate = new Date(now.getFullYear(), now.getMonth(), recurringBill.dueDay)
        if (dueDate < now) {
          dueDate.setMonth(dueDate.getMonth() + 1)
        }
      } else {
        // Default to end of month
        const now = new Date()
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }

      // Determine amount
      let amount = parsed.amount || 0
      if (!amount && recurringBill?.amountType === 'FIXED' && recurringBill.fixedAmount) {
        amount = Number(recurringBill.fixedAmount)
      }

      // Get founders for payment splitting
      const founders = await prisma.user.findMany({
        where: { isFounder: true },
        select: { id: true }
      })

      const founderCount = founders.length
      const perPersonAmount = founderCount > 0 ? amount / founderCount : amount

      // Create bill instance with founder payments
      const billInstance = await prisma.billInstance.create({
        data: {
          recurringBillId: recurringBill?.id,
          vendor: parsed.vendor,
          vendorType: parsed.vendorType,
          amount,
          dueDate,
          period,
          status: isPaid ? 'PAID' : 'PENDING',
          paidDate: isPaid ? new Date() : null,
          paidVia: isPaid ? (parsed.paymentMethod || 'Confirmed via email') : null,
          emailId: email.id,
          emailSubject: email.subject,
          emailFrom: email.from,
          founderPayments: {
            create: founders.map(founder => ({
              userId: founder.id,
              amount: perPersonAmount,
              status: isPaid ? 'PAID' : 'PENDING',
              paidDate: isPaid ? new Date() : null
            }))
          }
        }
      })

      await this.markProcessed(email.id, parsed.vendor, billInstance.id)
      console.log(`[PARSER] Created bill instance: ${parsed.vendor} - $${amount}`)
      return billInstance
    } catch (error: any) {
      console.error('[PARSER] Error creating bill instance:', error.message)
      return null
    }
  }

  private async markProcessed(emailId: string, vendor?: string, billId?: string): Promise<void> {
    await prisma.processedEmail.create({
      data: {
        emailId,
        vendor,
        billId
      }
    }).catch(() => {
      // Ignore duplicate errors
    })
  }
}

export const billParser = new BillParser()
