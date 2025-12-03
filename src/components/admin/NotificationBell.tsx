'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  ORDER_NEW: '#10b981',
  ORDER_STATUS: '#3b82f6',
  ORDER_REFUND: '#ef4444',
  INVENTORY_LOW: '#f59e0b',
  INVENTORY_OUT: '#ef4444',
  CUSTOM_REQUEST: '#8b5cf6',
  SERVICE_INQUIRY: '#06b6d4',
  REVIEW_NEW: '#f59e0b',
  USER_SIGNUP: '#10b981',
  SYSTEM: '#6b7280',
}

const TYPE_LABELS: Record<string, string> = {
  ORDER_NEW: 'New Order',
  ORDER_STATUS: 'Order Update',
  ORDER_REFUND: 'Refund',
  INVENTORY_LOW: 'Low Stock',
  INVENTORY_OUT: 'Out of Stock',
  CUSTOM_REQUEST: '3D Print Request',
  SERVICE_INQUIRY: 'Service Inquiry',
  REVIEW_NEW: 'New Review',
  USER_SIGNUP: 'New Customer',
  SYSTEM: 'System',
}

export default function NotificationBell() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Only fetch notifications when authenticated
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only fetch if authenticated
    if (status !== 'authenticated' || !session) return

    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [status, session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?filter=all&limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.stats?.unread || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' })
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'POST' })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  // Don't render until mounted and authenticated to prevent hydration issues
  if (!mounted || status !== 'authenticated') {
    return null
  }

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Notification Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          width: '380px',
          maxHeight: '500px',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Notifications</h3>
              {unreadCount > 0 && (
                <p style={{ fontSize: '12px', color: '#71717a', margin: '4px 0 0 0' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: 'transparent',
                    color: '#3b82f6',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              )}
              <a
                href="/admin/notifications"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: '#27272a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                View All
              </a>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#71717a',
              }}>
                <svg style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: '#71717a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p style={{ margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '14px 20px',
                    borderBottom: index < notifications.length - 1 ? '1px solid #27272a' : 'none',
                    cursor: notification.link ? 'pointer' : 'default',
                    background: notification.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (notification.link) {
                      e.currentTarget.style.background = notification.isRead
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(59, 130, 246, 0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead
                      ? 'transparent'
                      : 'rgba(59, 130, 246, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Unread dot */}
                    {!notification.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        marginTop: '6px',
                        flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: TYPE_COLORS[notification.type] || '#6b7280',
                          background: `${TYPE_COLORS[notification.type] || '#6b7280'}20`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}>
                          {TYPE_LABELS[notification.type] || notification.type}
                        </span>
                        <span style={{ fontSize: '11px', color: '#71717a' }}>
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: notification.isRead ? 400 : 600,
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#a1a1aa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {notification.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen ? '#3b82f6' : '#18181b',
          border: '1px solid #27272a',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = '#27272a'
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = '#18181b'
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        {/* Bell Icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#ffffff' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '22px',
            height: '22px',
            borderRadius: '11px',
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            border: '2px solid #000000',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
    </div>
  )
}
