import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invoice/[invoiceNumber] - Public endpoint to view invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceNumber: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: params.invoiceNumber },
      include: {
        items: true,
        inquiry: {
          select: {
            inquiryNumber: true,
            serviceType: true,
            description: true,
          },
        },
        customRequest: {
          select: {
            requestNumber: true,
            material: true,
            finish: true,
            color: true,
            quantity: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update viewedAt timestamp if not already viewed
    if (!invoice.viewedAt) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          viewedAt: new Date(),
          status: invoice.status === 'SENT' ? 'VIEWED' : invoice.status,
        },
      })
    }

    // Return invoice data (excluding internal notes and createdBy)
    const publicInvoice = {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerCompany: invoice.customerCompany,
      customerPhone: invoice.customerPhone,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      notes: invoice.notes,
      stripePaymentLink: invoice.stripePaymentLink,
      createdAt: invoice.createdAt,
      inquiry: invoice.inquiry,
      customRequest: invoice.customRequest,
    }

    return NextResponse.json({ invoice: publicInvoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
