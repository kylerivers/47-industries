'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  image?: string
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  trackingNumber?: string
  carrier?: string
  customerNotes?: string
  adminNotes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b',
      PROCESSING: '#3b82f6',
      PAID: '#10b981',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
      REFUNDED: '#6b7280',
    }
    return colors[status] || '#6b7280'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b',
      PROCESSING: '#3b82f6',
      SUCCEEDED: '#10b981',
      FAILED: '#ef4444',
      REFUNDED: '#6b7280',
    }
    return colors[status] || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PAID', label: 'Paid' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REFUNDED', label: 'Refunded' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: 700,
          marginBottom: '8px',
          margin: 0
        }}>Orders</h1>
        <p style={{
          color: '#a1a1aa',
          margin: 0,
          fontSize: isMobile ? '14px' : '16px'
        }}>View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search by order #, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
            }}
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            minWidth: '150px',
          }}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#71717a', margin: 0 }}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#71717a' }}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>No orders yet</h3>
          <p style={{ color: '#71717a', margin: 0 }}>
            Orders will appear here when customers make purchases
          </p>
        </div>
      ) : (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Table Header - Desktop */}
          {!isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr auto',
              gap: '16px',
              padding: '16px 24px',
              borderBottom: '1px solid #27272a',
              background: '#09090b',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Order</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Customer</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Total</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Status</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Date</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Actions</div>
            </div>
          )}

          {/* Orders */}
          {orders.map((order, index) => (
            <div
              key={order.id}
              style={{
                display: isMobile ? 'block' : 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr 1fr 1fr 1fr auto',
                gap: '16px',
                padding: isMobile ? '16px' : '16px 24px',
                borderBottom: index < orders.length - 1 ? '1px solid #27272a' : 'none',
                alignItems: 'center',
              }}
            >
              {/* Order Number */}
              <div>
                <span style={{ fontWeight: 600 }}>{order.orderNumber}</span>
                {isMobile && (
                  <span style={{ color: '#71717a', fontSize: '14px', marginLeft: '8px' }}>
                    {formatDate(order.createdAt)}
                  </span>
                )}
              </div>

              {/* Customer */}
              <div>
                <div style={{ fontWeight: 500 }}>{order.customerName}</div>
                <div style={{ fontSize: '14px', color: '#71717a' }}>{order.customerEmail}</div>
              </div>

              {/* Total */}
              <div style={{ fontWeight: 600 }}>
                ${Number(order.total).toFixed(2)}
                {isMobile && (
                  <span style={{ fontSize: '14px', color: '#71717a', fontWeight: 400 }}>
                    {' '}({order.items.length} items)
                  </span>
                )}
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status),
                }}>
                  {order.status}
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: `${getPaymentStatusColor(order.paymentStatus)}20`,
                  color: getPaymentStatusColor(order.paymentStatus),
                }}>
                  {order.paymentStatus}
                </span>
              </div>

              {/* Date - Desktop only */}
              {!isMobile && (
                <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
                  {formatDate(order.createdAt)}
                </div>
              )}

              {/* Actions */}
              <div style={{ marginTop: isMobile ? '12px' : 0 }}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
