import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { CustomRequestStatus } from '@prisma/client'
import { getAdminAuthInfo } from '@/lib/auth-helper'

// Initialize Resend lazily
let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// BCC addresses for all confirmation emails
const CONFIRMATION_BCC = ['confirmations@47industries.com', 'kylerivers4@gmail.com']

// POST /api/admin/custom-requests/send-quote - Send 3D print quote to customer
export async function POST(req: NextRequest) {
  try {
    const auth = await getAdminAuthInfo(req)

    if (!auth.isAuthorized || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.to || !body.name || !body.requestNumber) {
      return NextResponse.json(
        { error: 'To, name, and request number are required' },
        { status: 400 }
      )
    }

    if (!body.perUnitPrice || !body.quantity || !body.totalPrice) {
      return NextResponse.json(
        { error: 'Per-unit price, quantity, and total price are required' },
        { status: 400 }
      )
    }

    const validDays = body.validDays || 14
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + validDays)
    const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    // Get user info for quotedBy field
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { email: true, name: true }
    })

    await getResend().emails.send({
      from: 'contact@47industries.com',
      to: body.to,
      bcc: CONFIRMATION_BCC,
      subject: `Your 3D Print Quote - ${body.requestNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #fff; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #fff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: none; }
            .quote-box { background: #f9f9f9; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .pricing-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
            .pricing-total { display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #3b82f6; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #3b82f6; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
            .expiry { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-top: 20px; }
            .production-time { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Your 3D Print Quote</h1>
              <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 16px;">47 Industries</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Hello ${body.name}!</h2>
              <p>We've reviewed your 3D printing request and prepared a quote for you:</p>

              <div class="quote-box">
                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Reference: ${body.requestNumber}</p>

                <div class="pricing-row">
                  <span style="color: #666;">Per Unit Price</span>
                  <span style="font-weight: 600;">$${body.perUnitPrice.toFixed(2)}</span>
                </div>

                <div class="pricing-row">
                  <span style="color: #666;">Quantity</span>
                  <span style="font-weight: 600;">${body.quantity} ${body.quantity === 1 ? 'unit' : 'units'}</span>
                </div>

                <div class="pricing-total">
                  <span style="font-size: 18px; font-weight: 600;">Total Price</span>
                  <span style="font-size: 24px; font-weight: bold; color: #10b981;">$${body.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              ${body.estimatedDays ? `
                <div class="production-time">
                  <p style="margin: 0; color: #1e40af;">
                    <strong>Estimated Production Time:</strong> ${body.estimatedDays} business ${body.estimatedDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
              ` : ''}

              ${body.notes ? `
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Additional Details</p>
                  <p style="margin: 0; color: #555; white-space: pre-wrap;">${body.notes}</p>
                </div>
              ` : ''}

              <div class="expiry">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Quote Valid Until:</strong> ${formattedExpiry}
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="margin-bottom: 15px;">Ready to move forward? Simply reply to this email or click the button below:</p>
                <a href="mailto:contact@47industries.com?subject=Re: ${body.requestNumber} - Accept Quote" class="button">
                  Accept Quote
                </a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Have questions about the quote or specifications? Reply to this email and we'll be happy to discuss your project in more detail.
              </p>

              <div class="footer">
                <p style="margin: 0;">47 Industries</p>
                <p style="margin: 5px 0;"><a href="https://47industries.com" style="color: #3b82f6;">47industries.com</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Save the quote as a message in the database if requestId is provided
    if (body.requestId) {
      // Build quote message
      let quoteMessage = `Quote: $${body.totalPrice.toFixed(2)} total`
      if (body.estimatedDays) {
        quoteMessage += `\nEstimated production: ${body.estimatedDays} business days`
      }
      if (body.notes) {
        quoteMessage += `\n\n${body.notes}`
      }

      await prisma.customRequestMessage.create({
        data: {
          requestId: body.requestId,
          message: quoteMessage,
          isFromAdmin: true,
          senderName: '47 Industries',
          isQuote: true,
          quoteAmount: body.totalPrice,
          quoteValidDays: validDays,
        },
      })

      // Update custom request with quote details
      await prisma.customRequest.update({
        where: { id: body.requestId },
        data: {
          status: CustomRequestStatus.QUOTED,
          estimatedPrice: body.totalPrice,
          estimatedDays: body.estimatedDays || null,
          quoteNotes: body.notes || null,
          quotedAt: new Date(),
          quotedBy: user?.email || user?.name || 'Admin',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending quote email:', error)
    return NextResponse.json(
      { error: 'Failed to send quote email' },
      { status: 500 }
    )
  }
}
