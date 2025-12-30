'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  subitems?: { label: string; href: string; tabValue?: string }[]
}

interface AdminSidebarProps {
  isMobile: boolean
  isMobileMenuOpen: boolean
  onCloseMobile: () => void
}

export default function AdminSidebar({ isMobile, isMobileMenuOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Auto-expand items based on current path
  useEffect(() => {
    const navItems: NavItem[] = [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Analytics', href: '/admin/analytics' },
      {
        label: 'Shop',
        href: '#',
        subitems: [
          { label: 'Products', href: '/admin/products' },
          { label: 'Categories', href: '/admin/categories' },
          { label: 'Orders', href: '/admin/orders' },
          { label: 'Inventory', href: '/admin/inventory' },
        ],
      },
      {
        label: 'Inquiries',
        href: '/admin/inquiries',
        subitems: [
          { label: '3D Print Requests', href: '/admin/inquiries', tabValue: 'print-requests' },
          { label: 'Service Inquiries', href: '/admin/inquiries', tabValue: 'service-inquiries' },
          { label: 'General Inquiries', href: '/admin/inquiries', tabValue: 'contact-forms' },
        ],
      },
      { label: 'Customers', href: '/admin/customers' },
      { label: 'Finances', href: '/admin/finances' },
      { label: 'Expenses', href: '/admin/expenses' },
      { label: 'Bills', href: '/admin/bills' },
      { label: 'Marketing', href: '/admin/marketing' },
      { label: 'Email', href: '/admin/email' },
      { label: 'Blog', href: '/admin/blog' },
      { label: 'Returns', href: '/admin/returns' },
      { label: 'Shipping', href: '/admin/shipping' },
      { label: 'Tax', href: '/admin/tax' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Settings', href: '/admin/settings' },
    ]

    const itemsToExpand: string[] = []
    navItems.forEach((item) => {
      if (item.subitems) {
        const hasActiveSubitem = item.subitems.some((sub) => pathname.startsWith(sub.href))
        if (hasActiveSubitem) {
          itemsToExpand.push(item.label)
        }
      }
    })
    setExpandedItems(itemsToExpand)
  }, [pathname])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isActive = (href: string, tabValue?: string) => {
    if (tabValue) {
      const currentTab = searchParams.get('tab')
      const basePath = href.split('?')[0]
      return pathname === basePath && currentTab === tabValue
    }
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Analytics', href: '/admin/analytics' },
    {
      label: 'Shop',
      href: '#',
      subitems: [
        { label: 'Products', href: '/admin/products' },
        { label: 'Categories', href: '/admin/categories' },
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Inventory', href: '/admin/inventory' },
      ],
    },
    {
      label: 'Inquiries',
      href: '/admin/inquiries',
      subitems: [
        { label: '3D Print Requests', href: '/admin/inquiries', tabValue: 'print-requests' },
        { label: 'Service Inquiries', href: '/admin/inquiries', tabValue: 'service-inquiries' },
        { label: 'General Inquiries', href: '/admin/inquiries', tabValue: 'contact-forms' },
      ],
    },
    { label: 'Customers', href: '/admin/customers' },
    { label: 'Finances', href: '/admin/finances' },
    { label: 'Expenses', href: '/admin/expenses' },
    { label: 'Bills', href: '/admin/bills' },
    { label: 'Marketing', href: '/admin/marketing' },
    { label: 'Email', href: '/admin/email' },
    { label: 'Blog', href: '/admin/blog' },
    { label: 'Returns', href: '/admin/returns' },
    { label: 'Shipping', href: '/admin/shipping' },
    { label: 'Tax', href: '/admin/tax' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '256px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: isMobile ? (isMobileMenuOpen ? 0 : '-256px') : 0,
          background: '#0a0a0a',
          borderRight: '1px solid #27272a',
          overflowY: 'auto',
          transition: 'left 0.3s ease',
          zIndex: 50,
        }}
      >
        <div style={{ padding: '24px' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
              }}
            >
              47 Admin
            </h1>
          </Link>

          <nav>
            {navItems.map((item) => (
              <div key={item.label} style={{ marginBottom: '4px' }}>
                {item.subitems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#a1a1aa',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#18181b'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#a1a1aa'
                      }}
                    >
                      <span>{item.label}</span>
                      <span
                        style={{
                          transform: expandedItems.includes(item.label)
                            ? 'rotate(90deg)'
                            : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        ›
                      </span>
                    </button>
                    {expandedItems.includes(item.label) && (
                      <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                        {item.subitems.map((subitem) => {
                          const active = isActive(subitem.href, subitem.tabValue)
                          const href = subitem.tabValue
                            ? `${subitem.href}?tab=${subitem.tabValue}`
                            : subitem.href
                          return (
                            <Link
                              key={subitem.label}
                              href={href}
                              onClick={isMobile ? onCloseMobile : undefined}
                              style={{
                                display: 'block',
                                padding: '8px 16px',
                                background: active ? '#3b82f6' : 'transparent',
                                borderRadius: '6px',
                                color: active ? 'white' : '#a1a1aa',
                                fontSize: '13px',
                                textDecoration: 'none',
                                marginBottom: '2px',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                if (!active) {
                                  e.currentTarget.style.background = '#18181b'
                                  e.currentTarget.style.color = 'white'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!active) {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = '#a1a1aa'
                                }
                              }}
                            >
                              {subitem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={isMobile ? onCloseMobile : undefined}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      background: isActive(item.href) ? '#3b82f6' : 'transparent',
                      borderRadius: '8px',
                      color: isActive(item.href) ? 'white' : '#a1a1aa',
                      fontSize: '14px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.background = '#18181b'
                        e.currentTarget.style.color = 'white'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#a1a1aa'
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
