import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth-helper'
import { sendInvoice } from '@/lib/email'
import { stripe, isStripeConfigured } from '@/lib/stripe'

// POST /api/admin/invoices/[id]/send - Send invoice to customer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice has already been paid' },
        { status: 400 }
      )
    }

    // Generate Stripe payment link if not already created
    let paymentLink = invoice.stripePaymentLink

    if (!paymentLink) {
      const stripePaymentLink = await stripe.paymentLinks.create({
        line_items: invoice.items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.description,
            },
            unit_amount: Math.round(parseFloat(item.unitPrice.toString()) * 100),
          },
          quantity: item.quantity,
        })),
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoice=${invoice.invoiceNumber}`,
          },
        },
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
        },
      })

      paymentLink = stripePaymentLink.url

      // Update invoice with payment link
      await prisma.invoice.update({
        where: { id: params.id },
        data: {
          stripePaymentLink: paymentLink,
        },
      })
    }

    // Send the invoice email
    const emailResult = await sendInvoice({
      to: invoice.customerEmail,
      name: invoice.customerName,
      invoiceNumber: invoice.invoiceNumber,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        total: parseFloat(item.total.toString()),
      })),
      subtotal: parseFloat(invoice.subtotal.toString()),
      taxAmount: parseFloat(invoice.taxAmount.toString()),
      total: parseFloat(invoice.total.toString()),
      dueDate: invoice.dueDate,
      paymentLink: paymentLink,
      notes: invoice.notes,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send invoice email' },
        { status: 500 }
      )
    }

    // Update invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        stripePaymentLink: paymentLink,
      },
      include: { items: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      invoice: updatedInvoice,
    })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    )
  }
}
