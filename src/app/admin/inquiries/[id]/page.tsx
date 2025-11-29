'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'

interface ServiceInquiry {
  id: string
  inquiryNumber: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  serviceType: string
  budget?: string
  timeline?: string
  description: string
  attachments?: any
  status: string
  assignedTo?: string
  estimatedCost?: number
  proposalUrl?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function InquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [inquiry, setInquiry] = useState<ServiceInquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Form state
  const [status, setStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [proposalUrl, setProposalUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchInquiry()
  }, [params.id])

  const fetchInquiry = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/inquiries/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setInquiry(data)
        setStatus(data.status)
        setAssignedTo(data.assignedTo || '')
        setEstimatedCost(data.estimatedCost?.toString() || '')
        setProposalUrl(data.proposalUrl || '')
        setAdminNotes(data.adminNotes || '')
      } else {
        router.push('/admin/inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error)
      router.push('/admin/inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo: assignedTo || null,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
          proposalUrl: proposalUrl || null,
          adminNotes: adminNotes || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setInquiry(data)
        alert('Inquiry updated successfully!')
      } else {
        alert('Failed to update inquiry')
      }
    } catch (error) {
      console.error('Error updating inquiry:', error)
      alert('Failed to update inquiry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/admin/inquiries')
      } else {
        alert('Failed to delete inquiry')
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      alert('Failed to delete inquiry')
    }
  }

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = {
      NEW: '#3b82f6',
      CONTACTED: '#8b5cf6',
      PROPOSAL_SENT: '#f59e0b',
      NEGOTIATING: '#f59e0b',
      ACCEPTED: '#10b981',
      DECLINED: '#ef4444',
      COMPLETED: '#10b981',
    }
    return colors[s] || '#6b7280'
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WEB_DEVELOPMENT: 'Web Development',
      APP_DEVELOPMENT: 'App Development',
      AI_SOLUTIONS: 'AI Solutions',
      CONSULTATION: 'Consultation',
      OTHER: 'Other',
    }
    return labels[type] || type
  }

  const getServiceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      WEB_DEVELOPMENT: '#3b82f6',
      APP_DEVELOPMENT: '#8b5cf6',
      AI_SOLUTIONS: '#10b981',
      CONSULTATION: '#f59e0b',
      OTHER: '#6b7280',
    }
    return colors[type] || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}>
        <p style={{ color: '#71717a' }}>Loading inquiry...</p>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}>
        <p style={{ color: '#71717a' }}>Inquiry not found</p>
      </div>
    )
  }

  const statuses = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'COMPLETED']

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <Link
            href="/admin/inquiries"
            style={{
              color: '#71717a',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '8px',
            }}
          >
            ← Back to Inquiries
          </Link>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 700,
            margin: 0,
          }}>Inquiry {inquiry.inquiryNumber}</h1>
          <p style={{ color: '#71717a', margin: '8px 0 0 0' }}>
            {formatDate(inquiry.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            background: `${getServiceTypeColor(inquiry.serviceType)}20`,
            color: getServiceTypeColor(inquiry.serviceType),
          }}>
            {getServiceTypeLabel(inquiry.serviceType)}
          </span>
          <span style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            background: `${getStatusColor(inquiry.status)}20`,
            color: getStatusColor(inquiry.status),
          }}>
            {inquiry.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: '24px',
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Customer Info */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Customer Information
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Name</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{inquiry.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Email</p>
                <a href={`mailto:${inquiry.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Phone</p>
                  <p style={{ margin: 0 }}>{inquiry.phone}</p>
                </div>
              )}
              {inquiry.company && (
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Company</p>
                  <p style={{ margin: 0 }}>{inquiry.company}</p>
                </div>
              )}
              {inquiry.website && (
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Website</p>
                  <a href={inquiry.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {inquiry.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Project Details
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Service Type</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{getServiceTypeLabel(inquiry.serviceType)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Budget</p>
                <p style={{ margin: 0 }}>{inquiry.budget || 'Not specified'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Timeline</p>
                <p style={{ margin: 0 }}>{inquiry.timeline || 'Flexible'}</p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Project Description</p>
              <div style={{
                padding: '16px',
                background: '#09090b',
                borderRadius: '12px',
              }}>
                <p style={{ margin: 0, color: '#a1a1aa', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {inquiry.description}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {inquiry.attachments && Array.isArray(inquiry.attachments) && inquiry.attachments.length > 0 && (
            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
                Attachments
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inquiry.attachments.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: '#09090b',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: '16px', color: '#71717a' }} />
                    <span style={{ color: '#3b82f6' }}>{attachment.name || `Attachment ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Update Inquiry */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Update Inquiry
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Assigned To
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member name..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Estimated Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Proposal URL
              </label>
              <input
                type="url"
                value={proposalUrl}
                onChange={(e) => setProposalUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Admin Notes (internal only)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                marginBottom: '12px',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              onClick={handleDelete}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Delete Inquiry
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={`mailto:${inquiry.email}?subject=Re: Your ${getServiceTypeLabel(inquiry.serviceType)} Inquiry - ${inquiry.inquiryNumber}`}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  background: '#09090b',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'white',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                Send Email
              </a>
              {inquiry.phone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    background: '#09090b',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'white',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  Call Customer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
