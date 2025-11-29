'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-store'

interface ShippingInfo {
  email: string
  name: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [shipping, setShipping] = useState<ShippingInfo>({
    email: '',
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShipping(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shipping,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-text-secondary">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">
            Add some products before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = getTotal()

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl">
          {/* Shipping Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={shipping.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={shipping.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shipping.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address1"
                  required
                  value={shipping.address1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Apartment, suite, etc.
                </label>
                <input
                  type="text"
                  name="address2"
                  value={shipping.address2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shipping.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shipping.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={shipping.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={shipping.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>

              <p className="text-xs text-text-secondary text-center">
                You'll be redirected to Stripe to complete your payment securely.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                          No Image
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-text-secondary">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-secondary">Calculated at payment</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tax</span>
                  <span className="text-text-secondary">Calculated at payment</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/cart"
                className="block text-center text-sm text-text-secondary hover:text-text-primary mt-4"
              >
                ← Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
