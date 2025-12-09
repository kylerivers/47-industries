'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Recipient {
  id: string
  name: string
  phone: string
  email: string | null
  active: boolean
  agreedAt: string
  createdAt: string
}

interface MessageLog {
  id: string
  phone: string
  message: string
  type: string
  vendor: string | null
  status: string
  createdAt: string
}

interface BillNotifierStatus {
  status: string
  recipients: number
  lastCheck: string
}

export default function ExpensesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'logs'>('overview')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([])
  const [status, setStatus] = useState<BillNotifierStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check permissions
  const userPermissions = (session?.user as any)?.permissions || []
  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || userPermissions.includes('expenses')

  useEffect(() => {
    if (session && !hasAccess) {
      router.push('/admin')
    }
  }, [session, hasAccess, router])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch status
      const statusRes = await fetch('/api/admin/expenses/status')
      if (statusRes.ok) {
        const data = await statusRes.json()
        setStatus(data)
      }

      if (activeTab === 'recipients') {
        const res = await fetch('/api/admin/expenses/recipients')
        if (res.ok) {
          const data = await res.json()
          setRecipients(data.recipients || [])
        }
      }

      if (activeTab === 'logs') {
        const res = await fetch('/api/admin/expenses/logs')
        if (res.ok) {
          const data = await res.json()
          setMessageLogs(data.logs || [])
        }
      }
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const toggleRecipient = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/expenses/recipients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active })
      })
      fetchData()
    } catch (err) {
      setError('Failed to update recipient')
    }
  }

  if (!hasAccess) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>
        You don't have permission to access this page.
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>Expenses</h1>
        <p style={{ color: '#a1a1aa' }}>Manage household bill notifications and recipients</p>
      </div>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Service Status</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: status?.status === 'running' ? '#10b981' : '#ef4444'
          }}>
            {status?.status === 'running' ? 'Online' : 'Offline'}
          </div>
        </div>

        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Recipients</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{status?.recipients || 0}</div>
        </div>

        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Last Check</div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>
            {status?.lastCheck ? new Date(status.lastCheck).toLocaleString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #27272a',
        paddingBottom: '16px'
      }}>
        {['overview', 'recipients', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab ? '#3b82f6' : '#27272a',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#71717a' }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Bill Monitoring</h2>
              <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                This system monitors your Gmail for bills from Duke Energy, Chase, Amex, Tote Enterprises (Trash),
                and Pinellas County Utilities (Water). It also watches for Bank of America balance alerts.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Monitored Services</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {[
                  { name: 'Duke Energy', icon: 'electricity' },
                  { name: 'Chase', icon: 'credit' },
                  { name: 'Amex', icon: 'credit' },
                  { name: 'Trash (Tote)', icon: 'trash' },
                  { name: 'Water (Pinellas)', icon: 'water' },
                  { name: 'Bank of America', icon: 'bank' },
                ].map(service => (
                  <div key={service.name} style={{
                    background: '#0a0a0a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px'
                  }}>
                    {service.name}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Consent Form</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '8px' }}>
                  Share this link with roommates to opt-in for SMS notifications:
                </p>
                <code style={{
                  display: 'block',
                  background: '#0a0a0a',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#3b82f6'
                }}>
                  https://47industries.com/legal/communications-preferences-v2
                </code>
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(39, 39, 42, 0.5)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Phone</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Signed Up</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
                        No recipients yet. Share the consent form to add roommates.
                      </td>
                    </tr>
                  ) : (
                    recipients.map(r => (
                      <tr key={r.id} style={{ borderTop: '1px solid #27272a' }}>
                        <td style={{ padding: '16px', fontSize: '14px' }}>{r.name}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>{r.phone}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>{r.email || '-'}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: r.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: r.active ? '#10b981' : '#ef4444'
                          }}>
                            {r.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#71717a' }}>
                          {new Date(r.agreedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => toggleRecipient(r.id, r.active)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #3f3f46',
                              background: '#0a0a0a',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            {r.active ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(39, 39, 42, 0.5)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Vendor</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Phone</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messageLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
                        No messages sent yet.
                      </td>
                    </tr>
                  ) : (
                    messageLogs.map(log => (
                      <tr key={log.id} style={{ borderTop: '1px solid #27272a' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#71717a' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', textTransform: 'capitalize' }}>
                          {log.type}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>
                          {log.vendor || '-'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>
                          {log.phone}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: log.status === 'sent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: log.status === 'sent' ? '#10b981' : '#ef4444'
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
