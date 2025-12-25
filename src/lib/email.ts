import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
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

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@47industries.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@47industries.com'
const CONFIRMATIONS_EMAIL = 'confirmations@47industries.com'
const BCC_EMAIL = 'kylerivers4@gmail.com'

// BCC addresses for all confirmation emails
const CONFIRMATION_BCC = [CONFIRMATIONS_EMAIL, BCC_EMAIL]

// Available email addresses for sending
export const EMAIL_ADDRESSES = {
  noreply: 'noreply@47industries.com',
  info: 'info@47industries.com',
  support: 'support@47industries.com',
  contact: 'contact@47industries.com',
  press: 'press@47industries.com',
  admin: 'admin@47industries.com',
} as const

export type EmailAddress = keyof typeof EMAIL_ADDRESSES

// Unified email template with dark mode support
function getEmailTemplate(content: string, title: string = '47 Industries') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>${title}</title>
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }

        /* Light mode (default) */
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          background-color: #f4f4f5;
          color: #18181b;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #0a0a0a !important;
            color: #ffffff !important;
          }
          .email-container {
            background-color: #0a0a0a !important;
          }
          .email-header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%) !important;
            border-bottom: 1px solid #27272a !important;
          }
          .email-content {
            background-color: #0a0a0a !important;
            border-left: 1px solid #27272a !important;
            border-right: 1px solid #27272a !important;
          }
          .email-footer {
            background-color: #0a0a0a !important;
            border: 1px solid #27272a !important;
            color: #71717a !important;
          }
          .card {
            background-color: #1a1a1a !important;
            border: 1px solid #27272a !important;
          }
          .text-primary {
            color: #ffffff !important;
          }
          .text-secondary {
            color: #a1a1aa !important;
          }
          .text-muted {
            color: #71717a !important;
          }
          .divider {
            border-color: #27272a !important;
          }
          a {
            color: #60a5fa !important;
          }
        }
      </style>
    </head>
    <body>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;" class="email-container">

              <!-- Header -->
              <tr>
                <td class="email-header" style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 32px 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">47 Industries</h1>
                  <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 14px; letter-spacing: 0.5px;">Digital Solutions</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td class="email-content" style="background-color: #ffffff; padding: 40px; border-left: 1px solid #e4e4e7; border-right: 1px solid #e4e4e7;">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="email-footer" style="background-color: #fafafa; padding: 32px 40px; text-align: center; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0 0 12px 0; color: #71717a; font-size: 13px;">47 Industries - Digital Solutions</p>
                  <p style="margin: 0 0 16px 0;">
                    <a href="https://47industries.com" style="color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;">47industries.com</a>
                  </p>
                  <p style="margin: 0; color: #a1a1aa; font-size: 11px; line-height: 1.6;">
                    Questions? Reply to this email or contact us at<br>
                    <a href="mailto:support@47industries.com" style="color: #3b82f6; text-decoration: none;">support@47industries.com</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Accent box component for reference numbers, quotes, etc
function getAccentBox(title: string, value: string, subtitle?: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${title}</p>
          <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 0.5px;">${value}</p>
          ${subtitle ? `<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${subtitle}</p>` : ''}
        </td>
      </tr>
    </table>
  `
}

// Card component for details
function getCard(content: string, noPadding: boolean = false) {
  const padding = noPadding ? '0' : '20px'
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 16px 0;" class="card">
      <tr>
        <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: ${padding};">
          ${content}
        </td>
      </tr>
    </table>
  `
}

// Button component
function getButton(text: string, url: string, isPrimary: boolean = true) {
  const bgColor = isPrimary ? '#3b82f6' : '#18181b'
  const hoverColor = isPrimary ? '#2563eb' : '#27272a'

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: ${bgColor};">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">${text}</a>
        </td>
      </tr>
    </table>
  `
}

// Detail row component
function getDetailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding: 12px 20px; border-bottom: 1px solid #e4e4e7;" class="divider">
        <p style="margin: 0 0 4px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;" class="text-muted">${label}</p>
        <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;" class="text-primary">${value}</p>
      </td>
    </tr>
  `
}

// Timeline/steps component
function getTimeline(steps: Array<{ number: number, title: string, description: string }>) {
  const stepsHtml = steps.map(step => `
    <tr>
      <td style="padding: 16px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="40" valign="top">
              <div style="width: 32px; height: 32px; background-color: #3b82f6; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; text-align: center; line-height: 32px;">
                ${step.number}
              </div>
            </td>
            <td valign="top" style="padding-left: 16px;">
              <p style="margin: 0 0 4px 0; color: #18181b; font-size: 15px; font-weight: 600;" class="text-primary">${step.title}</p>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.5;" class="text-muted">${step.description}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return getCard(`
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${stepsHtml}
    </table>
  `, true)
}

// 1. Custom 3D Print Request Confirmation
export async function sendCustomRequestConfirmation(data: {
  to: string
  name: string
  requestNumber: string
  material?: string
  finish?: string
  color?: string
  quantity?: number
}) {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Hello ${data.name}!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Thank you for submitting your 3D printing request. We've received your files and specifications.
    </p>

    ${getAccentBox('Request Number', data.requestNumber)}

    ${data.material ? getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 16px 0;">
            <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" class="text-primary">Request Details</p>
          </td>
        </tr>
        ${getDetailRow('Material', data.material)}
        ${getDetailRow('Finish', data.finish || 'Standard')}
        ${getDetailRow('Color', data.color || 'Default')}
        ${getDetailRow('Quantity', String(data.quantity || 1))}
      </table>
    `, true) : ''}

    <h3 style="margin: 32px 0 16px 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">
      What Happens Next
    </h3>

    ${getTimeline([
      { number: 1, title: 'Review', description: 'Our team will review your 3D model and specifications' },
      { number: 2, title: 'Quote Preparation', description: 'We\'ll prepare a detailed quote within 24-48 hours' },
      { number: 3, title: 'Quote Delivery', description: 'You\'ll receive an email with pricing and estimated delivery time' },
    ])}

    <p style="margin: 32px 0 0 0; color: #52525b; font-size: 14px; text-align: center;" class="text-secondary">
      Expect to hear from us within <strong style="color: #18181b;" class="text-primary">24-48 hours</strong>
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `3D Print Request Received - ${data.requestNumber}`,
      html: getEmailTemplate(content, '3D Print Request Received'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send custom request confirmation:', error)
    return { success: false, error }
  }
}

// 2. Contact Form Confirmation
export async function sendContactConfirmation(data: {
  to: string
  name: string
  inquiryNumber: string
  subject: string
}) {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Hello ${data.name}!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Thank you for reaching out to us. We've received your inquiry about:
    </p>

    ${getCard(`
      <p style="margin: 0; padding: 20px; color: #18181b; font-size: 15px; font-weight: 500; border-left: 4px solid #3b82f6; background-color: #eff6ff;" class="text-primary">
        ${data.subject}
      </p>
    `)}

    ${getAccentBox('Reference Number', data.inquiryNumber)}

    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      One of our team members will review your message and get back to you within 1-2 business days.
    </p>

    <p style="margin: 0; color: #52525b; font-size: 14px; text-align: center;" class="text-secondary">
      In the meantime, feel free to explore our services at <a href="https://47industries.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">47industries.com</a>
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `We received your message - ${data.inquiryNumber}`,
      html: getEmailTemplate(content, 'Message Received'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send contact confirmation:', error)
    return { success: false, error }
  }
}

// 3. Service Inquiry Confirmation
export async function sendServiceInquiryConfirmation(data: {
  to: string
  name: string
  inquiryNumber: string
  serviceType: string
  projectName?: string
  services?: string[]
  budget?: string
  timeline?: string
  description?: string
}) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://47industries.com'
  const trackingUrl = `${APP_URL}/inquiry/${data.inquiryNumber}`

  const servicesHtml = data.services && data.services.length > 0
    ? data.services.map(s => `
        <span style="display: inline-block; background-color: #eff6ff; color: #3b82f6; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; margin: 4px 4px 4px 0;">
          ${s}
        </span>
      `).join('')
    : `<span style="display: inline-block; background-color: #eff6ff; color: #3b82f6; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">${data.serviceType}</span>`

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Hello ${data.name}!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Thank you for your interest in working with us. We've received your project inquiry and our team is excited to review it.
    </p>

    ${getAccentBox('Reference Number', data.inquiryNumber)}

    ${getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 16px 0;">
            <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" class="text-primary">Project Summary</p>
          </td>
        </tr>
        ${data.projectName ? getDetailRow('Project Name', data.projectName) : ''}
        <tr>
          <td style="padding: 12px 20px; border-bottom: 1px solid #e4e4e7;" class="divider">
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;" class="text-muted">Services Requested</p>
            <div style="margin: 0;">${servicesHtml}</div>
          </td>
        </tr>
        ${data.budget ? getDetailRow('Budget Range', data.budget) : ''}
        ${data.timeline ? getDetailRow('Timeline', data.timeline) : ''}
        ${data.description ? `
          <tr>
            <td style="padding: 12px 20px;">
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;" class="text-muted">Project Description</p>
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;" class="text-secondary">${data.description.length > 200 ? data.description.substring(0, 200) + '...' : data.description}</p>
            </td>
          </tr>
        ` : ''}
      </table>
    `, true)}

    <div style="text-align: center;">
      ${getButton('View Full Inquiry & Updates', trackingUrl)}
    </div>

    <h3 style="margin: 32px 0 16px 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">
      What Happens Next
    </h3>

    ${getTimeline([
      { number: 1, title: 'Review', description: 'Our team will carefully review your project requirements' },
      { number: 2, title: 'Discovery Call', description: 'We\'ll schedule a call to discuss your vision in detail' },
      { number: 3, title: 'Proposal', description: 'You\'ll receive a detailed proposal with timeline and pricing' },
    ])}

    <p style="margin: 32px 0 0 0; color: #52525b; font-size: 14px; text-align: center;" class="text-secondary">
      Expect to hear from us within <strong style="color: #18181b;" class="text-primary">1-2 business days</strong>
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Project Inquiry Received - ${data.inquiryNumber}`,
      html: getEmailTemplate(content, 'Project Inquiry Received'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send service inquiry confirmation:', error)
    return { success: false, error }
  }
}

// 4. Admin Notification
export async function sendAdminNotification(data: {
  type: 'custom_request' | 'contact' | 'order' | 'service_inquiry'
  title: string
  details: string
  link: string
}) {
  const typeLabels: Record<string, string> = {
    custom_request: '3D Print Request',
    contact: 'Contact Message',
    order: 'Order',
    service_inquiry: 'Service Inquiry',
  }

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      New ${typeLabels[data.type]}
    </h2>

    <h3 style="margin: 0 0 24px 0; color: #3b82f6; font-size: 18px; font-weight: 600;">
      ${data.title}
    </h3>

    ${getCard(`
      <div style="padding: 20px;">
        <pre style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Roboto', sans-serif;" class="text-secondary">${data.details}</pre>
      </div>
    `)}

    <div style="text-align: center;">
      ${getButton('View in Admin Panel', data.link)}
    </div>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      bcc: CONFIRMATION_BCC,
      subject: `[47 Industries] New ${typeLabels[data.type]} - ${data.title}`,
      html: getEmailTemplate(content, `New ${typeLabels[data.type]}`),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    return { success: false, error }
  }
}

// 5. Reply Email
export async function sendReplyEmail(data: {
  to: string
  subject: string
  message: string
  referenceNumber?: string
  fromAddress?: string
  senderName?: string
}) {
  const fromEmail = data.fromAddress || FROM_EMAIL
  const from = data.senderName ? `${data.senderName} <${fromEmail}>` : fromEmail

  const content = `
    <h2 style="margin: 0 0 24px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      ${data.subject}
    </h2>

    ${getCard(`
      <div style="padding: 20px;">
        <div style="margin: 0; color: #18181b; font-size: 15px; line-height: 1.8; white-space: pre-wrap;" class="text-primary">${data.message.replace(/\n/g, '<br>')}</div>
      </div>
    `)}

    ${data.referenceNumber ? `
      <p style="margin: 24px 0 0 0; color: #71717a; font-size: 13px; text-align: center;" class="text-muted">
        Reference: <strong style="color: #52525b;" class="text-secondary">${data.referenceNumber}</strong>
      </p>
    ` : ''}
  `

  try {
    await getResend().emails.send({
      from,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: data.referenceNumber ? `Re: ${data.subject} [${data.referenceNumber}]` : `Re: ${data.subject}`,
      html: getEmailTemplate(content, data.subject),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send reply email:', error)
    return { success: false, error }
  }
}

// 6. Order Confirmation
export async function sendOrderConfirmation(data: {
  to: string
  name: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  shipping: number
  tax: number
  total: number
}) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 16px 20px; border-bottom: 1px solid #e4e4e7;" class="divider">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="60%" style="padding-right: 16px;">
              <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 500;" class="text-primary">${item.name}</p>
              <p style="margin: 4px 0 0 0; color: #71717a; font-size: 13px;" class="text-muted">Qty: ${item.quantity}</p>
            </td>
            <td width="40%" align="right">
              <p style="margin: 0; color: #18181b; font-size: 15px; font-weight: 600;" class="text-primary">$${item.price.toFixed(2)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Thank you, ${data.name}!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Your order has been confirmed and is being processed.
    </p>

    ${getAccentBox('Order Number', data.orderNumber)}

    ${getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 20px 20px 16px 20px;">
            <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" class="text-primary">Order Items</p>
          </td>
        </tr>
        ${itemsHtml}
      </table>
    `, true)}

    ${getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #52525b; font-size: 14px;" class="text-secondary">Subtotal</p>
                </td>
                <td align="right" style="padding: 8px 0;">
                  <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 500;" class="text-primary">$${data.subtotal.toFixed(2)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #52525b; font-size: 14px;" class="text-secondary">Shipping</p>
                </td>
                <td align="right" style="padding: 8px 0;">
                  <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 500;" class="text-primary">$${data.shipping.toFixed(2)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <p style="margin: 0; color: #52525b; font-size: 14px;" class="text-secondary">Tax</p>
                </td>
                <td align="right" style="padding: 8px 0;">
                  <p style="margin: 0; color: #18181b; font-size: 14px; font-weight: 500;" class="text-primary">$${data.tax.toFixed(2)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 0 0 0; border-top: 2px solid #e4e4e7;" class="divider">
                  <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">Total</p>
                </td>
                <td align="right" style="padding: 16px 0 0 0; border-top: 2px solid #e4e4e7;" class="divider">
                  <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 700;" class="text-primary">$${data.total.toFixed(2)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)}

    <p style="margin: 32px 0 0 0; color: #52525b; font-size: 14px; text-align: center;" class="text-secondary">
      We'll send you another email with tracking information once your order ships.
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: getEmailTemplate(content, 'Order Confirmed'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
    return { success: false, error }
  }
}

// 7. Shipping Notification
export async function sendShippingNotification(data: {
  to: string
  name: string
  orderNumber: string
  trackingNumber: string
  carrier: string
}) {
  const trackingUrl = getCarrierTrackingUrl(data.carrier, data.trackingNumber)

  const content = `
    <div style="text-align: center; margin: 0 0 24px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; border-radius: 16px;">
        <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">📦</p>
        <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">SHIPPED</p>
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700; text-align: center;" class="text-primary">
      Your Order is On Its Way!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6; text-align: center;" class="text-secondary">
      Hello ${data.name}! Great news - your order has been shipped and is heading your way.
    </p>

    ${getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${getDetailRow('Order Number', data.orderNumber)}
        ${getDetailRow('Carrier', data.carrier)}
        ${getDetailRow('Tracking Number', data.trackingNumber)}
      </table>
    `, true)}

    <div style="text-align: center;">
      ${getButton('Track Your Package', trackingUrl)}
    </div>

    <p style="margin: 32px 0 0 0; color: #71717a; font-size: 13px; text-align: center;" class="text-muted">
      Delivery times vary based on your location and shipping method selected.<br>
      Most orders arrive within 5-10 business days.
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Your Order Has Shipped - ${data.orderNumber}`,
      html: getEmailTemplate(content, 'Order Shipped'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send shipping notification:', error)
    return { success: false, error }
  }
}

// 8. Digital Product Delivery
export async function sendDigitalProductDelivery(data: {
  to: string
  name: string
  orderNumber: string
  items: Array<{
    name: string
    downloadUrl: string
    downloadToken: string
    expiresAt: Date
    downloadLimit: number
  }>
  total: number
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://47industries.com'

  const itemsHtml = data.items.map(item => {
    const downloadLink = `${appUrl}/api/download/${item.downloadToken}`
    const expiryDate = new Date(item.expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return getCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">${item.name}</h3>
            <p style="margin: 0 0 16px 0; color: #71717a; font-size: 13px;" class="text-muted">
              Downloads remaining: <strong>${item.downloadLimit}</strong> • Expires: <strong>${expiryDate}</strong>
            </p>
            <div style="text-align: left;">
              ${getButton('Download File', downloadLink, false)}
            </div>
          </td>
        </tr>
      </table>
    `)
  }).join('')

  const content = `
    <div style="text-align: center; margin: 0 0 24px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 24px; border-radius: 16px;">
        <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">⬇</p>
        <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">READY</p>
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700; text-align: center;" class="text-primary">
      Your Downloads Are Ready!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6; text-align: center;" class="text-secondary">
      Hello ${data.name || 'there'}! Thank you for your purchase. Your digital products are ready for download.
    </p>

    ${getAccentBox('Order Number', data.orderNumber)}

    <h3 style="margin: 32px 0 16px 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">
      Your Downloads
    </h3>

    ${itemsHtml}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>Important:</strong> Download links are unique to your order and have limited downloads. Please save your files after downloading.
          </p>
        </td>
      </tr>
    </table>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Your Digital Downloads Are Ready - ${data.orderNumber}`,
      html: getEmailTemplate(content, 'Downloads Ready'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send digital product delivery email:', error)
    return { success: false, error }
  }
}

// 9. Payment Failure Notification
export async function sendPaymentFailureNotification(data: {
  to: string
  name: string
  orderNumber?: string
  amount: number
  reason?: string
}) {
  const content = `
    <div style="text-align: center; margin: 0 0 24px 0;">
      <div style="display: inline-block; background-color: #fef2f2; border: 2px solid #dc2626; padding: 24px; border-radius: 16px;">
        <p style="margin: 0; color: #dc2626; font-size: 32px; font-weight: 700;">⚠</p>
        <p style="margin: 12px 0 0 0; color: #dc2626; font-size: 20px; font-weight: 700;">PAYMENT FAILED</p>
      </div>
    </div>

    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Hello ${data.name || 'there'},
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Unfortunately, we were unable to process your payment of <strong style="color: #18181b;" class="text-primary">$${data.amount.toFixed(2)}</strong>.
    </p>

    ${data.reason ? getCard(`
      <div style="padding: 20px;">
        <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 600;">Reason</p>
        <p style="margin: 8px 0 0 0; color: #52525b; font-size: 14px;" class="text-secondary">${data.reason}</p>
      </div>
    `) : ''}

    <h3 style="margin: 32px 0 16px 0; color: #18181b; font-size: 16px; font-weight: 700;" class="text-primary">
      What You Can Do
    </h3>

    ${getCard(`
      <ul style="margin: 0; padding: 20px 20px 20px 40px; color: #52525b; font-size: 14px; line-height: 1.8;" class="text-secondary">
        <li>Check that your card details are correct</li>
        <li>Ensure your card has sufficient funds</li>
        <li>Contact your bank if the issue persists</li>
        <li>Try a different payment method</li>
      </ul>
    `)}

    <div style="text-align: center;">
      ${getButton('Try Again', 'https://47industries.com/shop')}
    </div>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Payment Failed${data.orderNumber ? ` - ${data.orderNumber}` : ''}`,
      html: getEmailTemplate(content, 'Payment Failed'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send payment failure notification:', error)
    return { success: false, error }
  }
}

// 10. 3D Print Quote Email
export async function sendQuoteEmail(data: {
  to: string
  name: string
  requestNumber: string
  estimatedPrice: number
  estimatedDays: number
  notes?: string
}) {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 700;" class="text-primary">
      Hello ${data.name}!
    </h2>
    <p style="margin: 0 0 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      Great news! We've reviewed your 3D printing request and prepared a quote for you.
    </p>

    ${getCard(`
      <div style="padding: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #71717a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;" class="text-muted">Request #${data.requestNumber}</p>
        <p style="margin: 0 0 16px 0; color: #10b981; font-size: 48px; font-weight: 700; line-height: 1;">$${data.estimatedPrice.toFixed(2)}</p>
        <p style="margin: 0; color: #52525b; font-size: 14px;" class="text-secondary">Estimated delivery: <strong style="color: #18181b;" class="text-primary">${data.estimatedDays} business days</strong></p>
      </div>
    `)}

    ${data.notes ? getCard(`
      <div style="padding: 20px;">
        <p style="margin: 0 0 12px 0; color: #18181b; font-size: 14px; font-weight: 700;" class="text-primary">Notes from our team:</p>
        <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;" class="text-secondary">${data.notes}</p>
      </div>
    `) : ''}

    <p style="margin: 24px 0; color: #52525b; font-size: 15px; line-height: 1.6;" class="text-secondary">
      <strong style="color: #18181b;" class="text-primary">Ready to proceed?</strong> Simply reply to this email to confirm your order, or let us know if you have any questions.
    </p>

    <p style="margin: 0; color: #71717a; font-size: 13px; text-align: center;" class="text-muted">
      This quote is valid for 14 days
    </p>
  `

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.to,
      bcc: CONFIRMATION_BCC,
      subject: `Your 3D Print Quote is Ready - ${data.requestNumber}`,
      html: getEmailTemplate(content, 'Quote Ready'),
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send quote email:', error)
    return { success: false, error }
  }
}

// Helper function for carrier tracking URLs
function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierLower = carrier.toLowerCase()

  if (carrierLower.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
  }
  if (carrierLower.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`
  }
  if (carrierLower.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
  }
  if (carrierLower.includes('dhl')) {
    return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`
  }

  return `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`
}
