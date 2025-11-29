'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-store'

interface OrderDetails {
  orderNumber: string
  email: string
  total: number
  status: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Clear cart on successful order
    clearCart()

    async function fetchOrderDetails() {
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/orders/session/${sessionId}`)
        if (!res.ok) {
          // Order might still be processing via webhook
          setOrder({
            orderNumber: 'Processing...',
            email: '',
            total: 0,
            status: 'processing',
          })
          setLoading(false)
          return
        }

        const data = await res.json()
        setOrder(data.order)
      } catch (err) {
        console.error('Error fetching order:', err)
        // Still show success, order will be created by webhook
        setOrder({
          orderNumber: 'Processing...',
          email: '',
          total: 0,
          status: 'processing',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">
          Loading order details...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center">
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
            Thank You for Your Order!
          </h1>

          <p className="text-xl text-text-secondary mb-8">
            Your order has been placed successfully.
          </p>

          {order && (
            <div className="bg-surface border border-border rounded-2xl p-8 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Order Number</span>
                  <span className="font-mono font-bold">
                    {order.orderNumber}
                  </span>
                </div>

                {order.email && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Confirmation Email</span>
                    <span>{order.email}</span>
                  </div>
                )}

                {order.total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                    {order.status === 'processing' ? 'Processing' : 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-text-secondary">
              We've sent a confirmation email with your order details.
              You'll receive another email when your order ships.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/shop"
                className="px-8 py-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Continue Shopping
              </Link>

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
              Questions about your order?{' '}
              <Link href="/contact" className="text-accent hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
