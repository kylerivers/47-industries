import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/webhooks/resend-inbound - Handle incoming email from Resend
// This webhook receives emails sent to contact@47industries.com and parses them
// to associate replies with existing inquiries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Resend inbound webhook payload structure
    const { from, to, subject, html, text, headers, reply_to } = body

    console.log('Received inbound email:', { from, to, subject })

    // Extract the In-Reply-To header to find the original message
    const inReplyTo = headers?.['in-reply-to'] || headers?.['In-Reply-To']

    if (!inReplyTo) {
      console.log('No In-Reply-To header found, cannot thread this message')
      return NextResponse.json({
        success: true,
        message: 'Email received but cannot be threaded (no In-Reply-To header)'
      })
    }

    // Find the message this is replying to
    const originalMessage = await prisma.inquiryMessage.findFirst({
      where: {
        emailMessageId: inReplyTo,
      },
      include: {
        inquiry: true,
      },
    })

    if (!originalMessage) {
      console.log('Could not find original message with ID:', inReplyTo)
      return NextResponse.json({
        success: true,
        message: 'Email received but original message not found'
      })
    }

    // Parse the sender's name and email
    const senderEmail = from?.address || from || ''
    const senderName = from?.name || from?.address?.split('@')[0] || 'Customer'

    // Extract reference number from subject if present
    const referenceMatch = subject?.match(/\[(INQ-\d{6}-[A-Z0-9]{4})\]/)
    const referenceNumber = referenceMatch?.[1] || originalMessage.inquiry.inquiryNumber

    // Create a new message in the conversation thread
    await prisma.inquiryMessage.create({
      data: {
        inquiryId: originalMessage.inquiryId,
        message: text || html || '', // Prefer plain text, fall back to HTML
        isFromAdmin: false, // This is from the customer
        senderName,
        senderEmail,
        emailMessageId: headers?.['message-id'] || headers?.['Message-ID'] || undefined,
        emailInReplyTo: inReplyTo,
        emailSubject: subject,
      },
    })

    // Update the inquiry's lastActivityAt timestamp (if that field exists)
    await prisma.serviceInquiry.update({
      where: { id: originalMessage.inquiryId },
      data: { updatedAt: new Date() },
    })

    console.log('Successfully threaded reply to inquiry:', originalMessage.inquiry.inquiryNumber)

    return NextResponse.json({
      success: true,
      message: 'Email received and threaded successfully',
      inquiryNumber: originalMessage.inquiry.inquiryNumber,
    })
  } catch (error) {
    console.error('Error processing inbound email:', error)

    // Return 200 anyway to prevent Resend from retrying
    // We log the error but don't want to cause delivery issues
    return NextResponse.json({
      success: false,
      error: 'Internal error processing email',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET endpoint for testing/verification
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'resend-inbound-webhook',
    message: 'This endpoint receives incoming emails from Resend'
  })
}
