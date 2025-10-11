export default function AdminDashboard() {
  const stats = [
    { label: 'Total Orders', value: '0', icon: '🛒', gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
    { label: 'Revenue', value: '$0', icon: '💰', gradient: 'linear-gradient(90deg, #10b981, #34d399)' },
    { label: '3D Print Requests', value: '0', icon: '🖨️', gradient: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
    { label: 'Service Inquiries', value: '0', icon: '💬', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
  ]

  const quickActions = [
    { title: 'Add Product', description: 'Create a new product listing', icon: '➕', href: '/admin/products' },
    { title: 'View Orders', description: 'Manage customer orders', icon: '📋', href: '/admin/orders' },
    { title: '3D Print Requests', description: 'Review custom print quotes', icon: '🖨️', href: '/admin/custom-requests' },
    { title: 'Settings', description: 'Configure your site', icon: '⚙️', href: '/admin/settings' },
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '8px',
          margin: 0
        }}>Dashboard</h1>
        <p style={{
          color: '#a1a1aa',
          margin: 0
        }}>Welcome to 47 Industries Admin</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#71717a',
                  marginBottom: '4px',
                  margin: 0
                }}>{stat.label}</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  margin: 0
                }}>{stat.value}</p>
              </div>
              <div style={{ fontSize: '36px' }}>{stat.icon}</div>
            </div>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: stat.gradient
            }} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '24px'
        }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '24px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                gap: '16px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '36px',
                flexShrink: 0
              }}>{action.icon}</div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  margin: 0
                }}>{action.title}</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#71717a',
                  margin: 0
                }}>{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '24px'
        }}>Recent Activity</h2>
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>📊</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px'
          }}>No recent activity</h3>
          <p style={{
            color: '#71717a',
            margin: 0
          }}>
            Your recent orders, requests, and updates will appear here
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Dashboard - Admin - 47 Industries',
}
