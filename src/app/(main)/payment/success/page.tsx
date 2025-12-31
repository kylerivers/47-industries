'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const invoiceNumber = searchParams.get('invoice')

  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<{ invoiceNumber: string; total: string } | null>(null)

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceNumber) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/invoice/${invoiceNumber}`)
        if (res.ok) {
          const data = await res.json()
          setInvoice({
            invoiceNumber: data.invoice.invoiceNumber,
            total: data.invoice.total,
          })
        }
      } catch (err) {
        console.error('Error fetching invoice:', err)
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
          <p className="text-text-secondary">Processing payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Payment Successful!
          </h1>

          <p className="text-xl text-text-secondary mb-8">
            Thank you for your payment. Your invoice has been marked as paid.
          </p>

          {invoice && (
            <div className="bg-surface border border-border rounded-2xl p-8 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Invoice Number</span>
                  <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Amount Paid</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${parseFloat(invoice.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Status</span>
                  <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Paid
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-text-secondary">
              A confirmation email has been sent to your email address with the payment receipt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {invoice && (
                <Link
                  href={`/invoice/${invoice.invoiceNumber}`}
                  className="px-8 py-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  View Invoice
                </Link>
              )}
              <Link
                href="/"
                className="px-8 py-4 border border-border rounded-lg font-medium hover:bg-surface transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-text-secondary text-sm">
              Need help?{' '}
              <Link href="/contact" className="text-accent hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Processing payment...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
