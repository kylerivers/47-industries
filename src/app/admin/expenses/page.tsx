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
  pushTokens?: number
  lastCheck: string
}

interface FinanceExpense {
  id: string
  vendor: string
  amount: number
  category: string
  date: string
  notes: string | null
  recurring: boolean
}

interface FinanceIncome {
  id: string
  source: string
  amount: number
  category: string
  date: string
  notes: string | null
}

interface FinanceData {
  expenses: FinanceExpense[]
  income: FinanceIncome[]
  totals: { expenses: number; income: number; net: number }
}

const EXPENSE_CATEGORIES = [
  'Bills & Utilities',
  'Rent/Mortgage',
  'Supplies',
  'Software/Subscriptions',
  'Marketing',
  'Equipment',
  'Shipping',
  'Other',
]

const INCOME_CATEGORIES = [
  'Product Sales',
  'Service Revenue',
  '3D Print Jobs',
  'Web Development',
  'App Development',
  'Other',
]

export default function ExpensesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'finances' | 'recipients' | 'logs'>('overview')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([])
  const [status, setStatus] = useState<BillNotifierStatus | null>(null)
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'expense' | 'income'>('expense')
  const [formVendor, setFormVendor] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0])
  const [formNotes, setFormNotes] = useState('')
  const [formRecurring, setFormRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

      if (activeTab === 'finances') {
        const res = await fetch('/api/admin/finances')
        if (res.ok) {
          const data = await res.json()
          setFinanceData(data)
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

  const openAddModal = (type: 'expense' | 'income') => {
    setModalType(type)
    setFormVendor('')
    setFormAmount('')
    setFormCategory('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormNotes('')
    setFormRecurring(false)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formVendor || !formAmount || !formCategory) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const endpoint = modalType === 'expense' ? '/api/admin/finances/expenses' : '/api/admin/finances/income'
      const body = modalType === 'expense'
        ? { vendor: formVendor, amount: parseFloat(formAmount), category: formCategory, date: formDate, notes: formNotes, recurring: formRecurring }
        : { source: formVendor, amount: parseFloat(formAmount), category: formCategory, date: formDate, notes: formNotes }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setShowModal(false)
        fetchData()
      } else {
        setError('Failed to add entry')
      }
    } catch (err) {
      setError('Failed to add entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, type: 'expense' | 'income') => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const endpoint = type === 'expense' ? `/api/admin/finances/expenses/${id}` : `/api/admin/finances/income/${id}`
      await fetch(endpoint, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      setError('Failed to delete entry')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
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
        <p style={{ color: '#a1a1aa' }}>Manage finances, bill notifications, and recipients</p>
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
          <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>SMS Recipients</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{status?.recipients || 0}</div>
        </div>

        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Push Devices</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{status?.pushTokens || 0}</div>
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
        {['overview', 'finances', 'recipients', 'logs'].map(tab => (
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

          {/* Finances Tab */}
          {activeTab === 'finances' && (
            <div>
              {/* Finance Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Total Expenses</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>
                    {formatCurrency(financeData?.totals.expenses || 0)}
                  </div>
                </div>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Total Income</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                    {formatCurrency(financeData?.totals.income || 0)}
                  </div>
                </div>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ color: '#71717a', fontSize: '14px', marginBottom: '4px' }}>Net</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: (financeData?.totals.net || 0) >= 0 ? '#10b981' : '#ef4444'
                  }}>
                    {formatCurrency(financeData?.totals.net || 0)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => openAddModal('expense')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Add Expense
                </button>
                <button
                  onClick={() => openAddModal('income')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Add Income
                </button>
              </div>

              {/* Expenses Table */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Expenses</h3>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(39, 39, 42, 0.5)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Vendor</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Category</th>
                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!financeData?.expenses || financeData.expenses.length === 0) ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
                            No expenses recorded yet.
                          </td>
                        </tr>
                      ) : (
                        financeData.expenses.map(exp => (
                          <tr key={exp.id} style={{ borderTop: '1px solid #27272a' }}>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#71717a' }}>
                              {new Date(exp.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px' }}>
                              {exp.vendor}
                              {exp.recurring && <span style={{ marginLeft: '8px', color: '#3b82f6', fontSize: '12px' }}>(Recurring)</span>}
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>{exp.category}</td>
                            <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                              -{formatCurrency(exp.amount)}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDelete(exp.id, 'expense')}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #3f3f46',
                                  background: 'transparent',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Income Table */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Income</h3>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(39, 39, 42, 0.5)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Source</th>
                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Category</th>
                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!financeData?.income || financeData.income.length === 0) ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#71717a' }}>
                            No income recorded yet.
                          </td>
                        </tr>
                      ) : (
                        financeData.income.map(inc => (
                          <tr key={inc.id} style={{ borderTop: '1px solid #27272a' }}>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#71717a' }}>
                              {new Date(inc.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px' }}>{inc.source}</td>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#a1a1aa' }}>{inc.category}</td>
                            <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                              +{formatCurrency(inc.amount)}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDelete(inc.id, 'income')}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1px solid #3f3f46',
                                  background: 'transparent',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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

      {/* Add Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            background: '#18181b',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid #27272a'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              Add {modalType === 'expense' ? 'Expense' : 'Income'}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
                {modalType === 'expense' ? 'Vendor/Payee' : 'Source'}
              </label>
              <input
                type="text"
                value={formVendor}
                onChange={(e) => setFormVendor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder={modalType === 'expense' ? 'e.g., Duke Energy' : 'e.g., Product Sale'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Amount</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="">Select category</option>
                {(modalType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Notes (optional)</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Add any notes..."
              />
            </div>

            {modalType === 'expense' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formRecurring}
                    onChange={(e) => setFormRecurring(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#a1a1aa' }}>This is a recurring expense</span>
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalType === 'expense' ? '#ef4444' : '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: submitting ? 0.5 : 1
                }}
              >
                {submitting ? 'Adding...' : `Add ${modalType === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
