import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'https://47industries.com/api/oauth/gmail/callback'
)

interface EmailMessage {
  id: string
  from: string
  subject: string
  body: string
  snippet: string
  date: string
}

export class GmailScanner {
  private processedEmailIds: Set<string> = new Set()

  async getRefreshTokens(): Promise<string[]> {
    // Support multiple Gmail accounts
    const tokens: string[] = []
    if (process.env.GMAIL_REFRESH_TOKEN) tokens.push(process.env.GMAIL_REFRESH_TOKEN)
    if (process.env.GMAIL_REFRESH_TOKEN_2) tokens.push(process.env.GMAIL_REFRESH_TOKEN_2)
    if (process.env.GMAIL_REFRESH_TOKEN_3) tokens.push(process.env.GMAIL_REFRESH_TOKEN_3)
    return tokens
  }

  buildSearchQuery(): string {
    // Search for bill-related emails
    const senders = [
      'duke-energy.com', 'duke energy',
      'chase.com', 'chase',
      'americanexpress.com', 'amex',
      'tote', 'netcomm',
      'pinellas', 'pcumail', 'water',
      'bankofamerica', 'boa', 'bank of america',
      'discover', 'capital one', 'citi',
      'spectrum', 'frontier', 'xfinity', 'comcast',
      'verizon', 't-mobile', 'att.com',
      'zelle', 'venmo', 'paypal'
    ]

    const subjectKeywords = [
      'bill is ready', 'e-bill', 'payment due', 'statement ready',
      'amount due', 'autopay', 'scheduled payment', 'payment confirmation',
      'payment received', 'transfer', 'sent money', 'you sent'
    ]

    const senderQuery = senders.map(s => `from:${s}`).join(' OR ')
    const subjectQuery = subjectKeywords.map(k => `subject:"${k}"`).join(' OR ')

    return `(${senderQuery}) OR (${subjectQuery})`
  }

  async fetchRecentEmails(refreshToken: string, daysBack: number = 1): Promise<EmailMessage[]> {
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - daysBack)
    const afterTimestamp = Math.floor(afterDate.getTime() / 1000)

    const query = `${this.buildSearchQuery()} after:${afterTimestamp}`

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 20
      })

      const messages = response.data.messages || []
      const emails: EmailMessage[] = []

      for (const msg of messages) {
        if (!msg.id || this.processedEmailIds.has(msg.id)) continue

        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          })

          const headers = detail.data.payload?.headers || []
          const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || ''
          const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || ''
          const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || ''

          const body = this.extractBody(detail.data.payload)

          emails.push({
            id: msg.id,
            from,
            subject,
            body,
            snippet: detail.data.snippet || '',
            date
          })

          this.processedEmailIds.add(msg.id)

          // Keep set size manageable
          if (this.processedEmailIds.size > 1000) {
            const arr = Array.from(this.processedEmailIds)
            this.processedEmailIds = new Set(arr.slice(-500))
          }
        } catch (err) {
          console.error(`Error fetching email ${msg.id}:`, err)
        }
      }

      return emails
    } catch (error: any) {
      console.error('Error fetching emails:', error.message)
      return []
    }
  }

  private extractBody(payload: any): string {
    if (!payload) return ''

    // Check for plain text body
    if (payload.mimeType === 'text/plain' && payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8')
    }

    // Check parts recursively
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8')
        }
        if (part.parts) {
          const nested = this.extractBody(part)
          if (nested) return nested
        }
      }

      // Fallback to HTML if no plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const html = Buffer.from(part.body.data, 'base64').toString('utf-8')
          // Strip HTML tags for basic text extraction
          return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        }
      }
    }

    return ''
  }

  async fetchFromAllAccounts(daysBack: number = 1): Promise<EmailMessage[]> {
    const tokens = await this.getRefreshTokens()
    const allEmails: EmailMessage[] = []

    for (const token of tokens) {
      try {
        const emails = await this.fetchRecentEmails(token, daysBack)
        allEmails.push(...emails)
      } catch (error: any) {
        console.error('Error fetching from account:', error.message)
      }
    }

    return allEmails
  }

  async isEmailProcessed(emailId: string): Promise<boolean> {
    const existing = await prisma.processedEmail.findUnique({
      where: { emailId }
    })
    return !!existing
  }

  async markEmailProcessed(emailId: string, vendor?: string, billId?: string): Promise<void> {
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

export const gmailScanner = new GmailScanner()
