'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/orders', label: 'Orders', icon: '🛒' },
    { href: '/admin/custom-requests', label: '3D Print Requests', icon: '🖨️' },
    { href: '/admin/inquiries', label: 'Service Inquiries', icon: '💬' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      margin: 0,
      padding: 0
    }}>
      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '256px',
        height: '100vh',
        background: '#0a0a0a',
        borderRight: '1px solid #27272a',
        zIndex: 50
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #27272a'
        }}>
          <Link href="/admin" style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
            textDecoration: 'none'
          }}>
            47 Admin
          </Link>
          <div style={{
            fontSize: '14px',
            color: '#71717a',
            marginTop: '4px'
          }}>Industries Dashboard</div>
        </div>

        <nav style={{ padding: '16px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive(item.href) ? '#ffffff' : '#a1a1aa',
                textDecoration: 'none',
                background: isActive(item.href) ? '#3b82f6' : 'transparent',
                marginBottom: '4px',
                transition: 'all 0.2s'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{
            borderTop: '1px solid #27272a',
            margin: '16px 0'
          }} />

          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#a1a1aa',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}>
            <span>←</span>
            Back to Site
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: '256px' }}>
        {/* Top Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #27272a'
        }}>
          <div style={{
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                margin: 0
              }}>Admin Panel</h1>
              <p style={{
                fontSize: '14px',
                color: '#71717a',
                marginTop: '4px',
                margin: 0
              }}>Manage your 47 Industries platform</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  margin: 0
                }}>{session?.user?.name || 'Admin User'}</p>
                <p style={{
                  fontSize: '12px',
                  color: '#71717a',
                  margin: 0
                }}>{session?.user?.email || 'admin@47industries.com'}</p>
              </div>
              <button
                onClick={async () => {
                  const { signOut } = await import('next-auth/react')
                  signOut({ callbackUrl: '/admin/login' })
                }}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >Logout</button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
