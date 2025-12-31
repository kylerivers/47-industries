'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: string
  total: string
}

interface Invoice {
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerCompany: string | null
  customerPhone: string | null
  items: InvoiceItem[]
  subtotal: string
  taxRate: string
  taxAmount: string
  total: string
  status: string
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  stripePaymentLink: string | null
  createdAt: string
  inquiry: {
    inquiryNumber: string
    serviceType: string
    description: string
  } | null
  customRequest: {
    requestNumber: string
    material: string
    finish: string
    color: string
    quantity: number
  } | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Draft' },
  SENT: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Sent' },
  VIEWED: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Viewed' },
  PAID: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
  CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  OVERDUE: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Overdue' },
}

export default function InvoiceViewPage() {
  const params = useParams()
  const invoiceNumber = params.invoiceNumber as string

  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceNumber) {
        setError('No invoice number provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/invoice/${invoiceNumber}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Invoice not found. Please check the invoice number and try again.')
          } else {
            setError('Failed to load invoice. Please try again later.')
          }
          setLoading(false)
          return
        }

        const data = await res.json()
        setInvoice(data.invoice)
      } catch (err) {
        console.error('Error fetching invoice:', err)
        setError('Failed to load invoice. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceNumber])

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Invoice Not Found</h1>
            <p className="text-text-secondary mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusStyle = STATUS_COLORS[invoice.status] || STATUS_COLORS.DRAFT
  const isPaid = invoice.status === 'PAID'
  const isCancelled = invoice.status === 'CANCELLED'

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">Invoice</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-text-secondary font-mono">{invoice.invoiceNumber}</p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <p className="text-text-secondary text-sm">Issued</p>
              <p className="font-medium">{new Date(invoice.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
              {invoice.dueDate && (
                <>
                  <p className="text-text-secondary text-sm mt-2">Due</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                </>
              )}
            </div>
          </div>

          {/* Invoice Card */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Company Info */}
            <div className="p-6 md:p-8 border-b border-border bg-surface-elevated/50">
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">47 Industries</h2>
                  <p className="text-text-secondary text-sm">contact@47industries.com</p>
                  <p className="text-text-secondary text-sm">47industries.com</p>
                </div>
                <div className="md:text-right">
                  <p className="text-text-secondary text-sm mb-1">Bill To</p>
                  <p className="font-semibold">{invoice.customerName}</p>
                  {invoice.customerCompany && (
                    <p className="text-text-secondary">{invoice.customerCompany}</p>
                  )}
                  <p className="text-text-secondary text-sm">{invoice.customerEmail}</p>
                  {invoice.customerPhone && (
                    <p className="text-text-secondary text-sm">{invoice.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Related Request/Inquiry */}
            {(invoice.inquiry || invoice.customRequest) && (
              <div className="p-6 md:p-8 border-b border-border bg-surface-elevated/30">
                <p className="text-text-secondary text-sm mb-2">Related to</p>
                {invoice.inquiry && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                      Service Inquiry
                    </span>
                    <span className="font-mono text-sm">{invoice.inquiry.inquiryNumber}</span>
                    <span className="text-text-secondary">-</span>
                    <span className="text-sm capitalize">
                      {invoice.inquiry.serviceType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                )}
                {invoice.customRequest && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                      3D Print Request
                    </span>
                    <span className="font-mono text-sm">{invoice.customRequest.requestNumber}</span>
                    <span className="text-text-secondary">-</span>
                    <span className="text-sm">
                      {invoice.customRequest.quantity}x {invoice.customRequest.material} ({invoice.customRequest.finish})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Line Items */}
            <div className="p-6 md:p-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-4 text-text-secondary font-medium text-sm">Description</th>
                    <th className="text-right pb-4 text-text-secondary font-medium text-sm w-20">Qty</th>
                    <th className="text-right pb-4 text-text-secondary font-medium text-sm w-28">Unit Price</th>
                    <th className="text-right pb-4 text-text-secondary font-medium text-sm w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-4">{item.description}</td>
                      <td className="py-4 text-right text-text-secondary">{item.quantity}</td>
                      <td className="py-4 text-right text-text-secondary">
                        ${parseFloat(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right font-medium">
                        ${parseFloat(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex justify-end">
                  <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span>${parseFloat(invoice.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {parseFloat(invoice.taxRate) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Tax ({invoice.taxRate}%)</span>
                        <span>${parseFloat(invoice.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-border text-lg font-bold">
                      <span>Total</span>
                      <span className="text-accent">
                        ${parseFloat(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-text-secondary text-sm mb-2">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {!isPaid && !isCancelled && invoice.stripePaymentLink && (
              <div className="p-6 md:p-8 border-t border-border bg-surface-elevated/50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Ready to pay?</h3>
                    <p className="text-text-secondary text-sm">
                      Secure payment powered by Stripe. All major credit cards accepted.
                    </p>
                  </div>
                  <a
                    href={invoice.stripePaymentLink}
                    className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors text-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ${parseFloat(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </a>
                </div>
              </div>
            )}

            {/* Paid Confirmation */}
            {isPaid && (
              <div className="p-6 md:p-8 border-t border-border bg-green-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-400">Payment Complete</h3>
                    <p className="text-text-secondary text-sm">
                      Paid on {invoice.paidAt && new Date(invoice.paidAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="p-6 md:p-8 border-t border-border bg-red-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-400">Invoice Cancelled</h3>
                    <p className="text-text-secondary text-sm">
                      This invoice has been cancelled and is no longer payable.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm mb-4">
              Questions about this invoice?{' '}
              <Link href="/contact" className="text-accent hover:underline">
                Contact us
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-text-secondary hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to 47 Industries
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
