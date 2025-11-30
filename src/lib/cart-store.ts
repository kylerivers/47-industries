'use client'

import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

// Track cart for abandoned cart analytics
function trackCart(items: CartItem[], totalValue: number) {
  if (typeof window === 'undefined') return

  const visitorId = localStorage.getItem('47i_visitor_id')
  const sessionId = sessionStorage.getItem('47i_session_id')

  if (!visitorId) return

  // Debounce tracking
  if ((window as any).__cartTrackTimeout) {
    clearTimeout((window as any).__cartTrackTimeout)
  }

  (window as any).__cartTrackTimeout = setTimeout(() => {
    fetch('/api/analytics/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        sessionId,
        items,
        totalValue
      })
    }).catch(() => {})
  }, 2000) // Wait 2 seconds before tracking to avoid spam
}

export const useCart = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          set((state) => {
            const existingItem = state.items.find(
              (i) => i.productId === item.productId
            )

            if (existingItem) {
              return {
                items: state.items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              }
            }

            return {
              items: [...state.items, item],
            }
          })
        },

        removeItem: (productId) => {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }))
        },

        updateQuantity: (productId, quantity) => {
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((i) => i.productId !== productId),
              }
            }

            return {
              items: state.items.map((i) =>
                i.productId === productId ? { ...i, quantity } : i
              ),
            }
          })
        },

        clearCart: () => {
          set({ items: [] })
        },

        getTotal: () => {
          const state = get()
          return state.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          )
        },

        getItemCount: () => {
          const state = get()
          return state.items.reduce((count, item) => count + item.quantity, 0)
        },
      }),
      {
        name: '47-industries-cart',
      }
    )
  )
)

// Subscribe to cart changes for abandoned cart tracking
if (typeof window !== 'undefined') {
  useCart.subscribe(
    (state) => state.items,
    (items) => {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      trackCart(items, total)
    }
  )
}
