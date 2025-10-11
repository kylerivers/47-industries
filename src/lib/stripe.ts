import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

/**
 * Format amount for Stripe (convert dollars to cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format amount from Stripe (convert cents to dollars)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}
