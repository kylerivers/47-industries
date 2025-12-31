import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
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

// Map form values to database enum values
const SERVICE_TYPE_MAP: Record<string, string> = {
  'WEB_DEVELOPMENT': 'WEB_DEVELOPMENT',
  'APP_DEVELOPMENT': 'APP_DEVELOPMENT',
  'AI_SOLUTIONS': 'AI_SOLUTIONS',
  'CONSULTATION': 'CONSULTATION',
  'OTHER': 'OTHER',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Honeypot check
    if (body.website_url) {
      return NextResponse.json({ error: 'Bot detected' }, { status: 400 })
    }

    // Validate required fields
    if (!body.name || !body.email || !body.serviceType || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map service type
    const serviceType = SERVICE_TYPE_MAP[body.serviceType]
    if (!serviceType) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      )
    }

    // Generate inquiry number
    const date = new Date()
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '') // YYMMDD
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()

    // Prefix based on service type
    const prefixes: Record<string, string> = {
      'WEB_DEVELOPMENT': 'WEB',
      'APP_DEVELOPMENT': 'APP',
      'AI_SOLUTIONS': 'AI',
      'CONSULTATION': 'CON',
      'OTHER': 'SVC',
    }
    const prefix = prefixes[serviceType] || 'SVC'
    const inquiryNumber = `${prefix}-${dateStr}-${randomStr}`

    // Create inquiry in database
    const inquiry = await prisma.serviceInquiry.create({
      data: {
        inquiryNumber,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        website: body.website || null,
        serviceType,
        budget: body.budget || null,
        timeline: body.timeline || null,
        description: body.description,
      },
    })

    // Send confirmation email to customer
    try {
      await getResend().emails.send({
        from: '47 Industries <noreply@47industries.com>',
        to: body.email,
        subject: `Service Inquiry Received - ${inquiryNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
                h1 { margin: 0; font-size: 24px; }
                .reference { font-size: 14px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Service Inquiry Received</h1>
                  <div class="reference">Reference: ${inquiryNumber}</div>
                </div>
                <div class="content">
                  <p>Hi ${body.name},</p>
                  <p>Thank you for your interest in our services! We've received your inquiry and our team will review it shortly.</p>

                  <div class="info-box">
                    <strong>What happens next:</strong>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                      <li>Our team will review your project requirements</li>
                      <li>We'll reach out within 24 hours to schedule a consultation call</li>
                      <li>After our discussion, you'll receive a detailed proposal with pricing and timeline</li>
                    </ol>
                  </div>

                  <p><strong>Your inquiry details:</strong></p>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Service Type:</strong> ${serviceType.replace('_', ' ')}</li>
                    ${body.budget ? `<li><strong>Budget:</strong> ${body.budget}</li>` : ''}
                    ${body.timeline ? `<li><strong>Timeline:</strong> ${body.timeline}</li>` : ''}
                  </ul>

                  <p>If you have any questions in the meantime, feel free to reply to this email or call us at your convenience.</p>

                  <p>Best regards,<br><strong>47 Industries Team</strong></p>
                </div>
                <div class="footer">
                  <p>47 Industries | <a href="https://47industries.com">47industries.com</a></p>
                  <p style="font-size: 12px; color: #999;">Please keep this email for your records. Reference number: ${inquiryNumber}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    // Send notification to admin
    try {
      await getResend().emails.send({
        from: '47 Industries <noreply@47industries.com>',
        to: 'contact@47industries.com',
        subject: `New Service Inquiry: ${serviceType.replace('_', ' ')} - ${inquiryNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .field { margin: 15px 0; }
                .label { font-weight: bold; color: #666; font-size: 14px; }
                .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
                .action-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">New Service Inquiry</h2>
                  <p style="margin: 5px 0 0 0; opacity: 0.8;">${inquiryNumber}</p>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Customer</div>
                    <div class="value">${body.name}${body.company ? ` (${body.company})` : ''}</div>
                  </div>
                  <div class="field">
                    <div class="label">Contact</div>
                    <div class="value">
                      Email: ${body.email}<br>
                      ${body.phone ? `Phone: ${body.phone}<br>` : ''}
                      ${body.website ? `Website: ${body.website}` : ''}
                    </div>
                  </div>
                  <div class="field">
                    <div class="label">Service Type</div>
                    <div class="value">${serviceType.replace('_', ' ')}</div>
                  </div>
                  ${body.budget ? `
                    <div class="field">
                      <div class="label">Budget</div>
                      <div class="value">${body.budget}</div>
                    </div>
                  ` : ''}
                  ${body.timeline ? `
                    <div class="field">
                      <div class="label">Timeline</div>
                      <div class="value">${body.timeline}</div>
                    </div>
                  ` : ''}
                  <div class="field">
                    <div class="label">Project Description</div>
                    <div class="value" style="white-space: pre-wrap;">${body.description}</div>
                  </div>
                  <a href="https://47industries.com/admin/inquiries/${inquiry.id}" class="action-button">View in Admin Console</a>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      inquiryNumber,
      id: inquiry.id,
    })
  } catch (error) {
    console.error('Error creating service inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
