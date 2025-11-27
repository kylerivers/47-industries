'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter, typeFilter])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('serviceType', typeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/inquiries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries)
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchInquiries()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: '#3b82f6',
      CONTACTED: '#8b5cf6',
      PROPOSAL_SENT: '#f59e0b',
      NEGOTIATING: '#f59e0b',
      ACCEPTED: '#10b981',
      DECLINED: '#ef4444',
      COMPLETED: '#10b981',
    }
    return colors[status] || '#6b7280'
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'NEW', label: 'New' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
    { value: 'NEGOTIATING', label: 'Negotiating' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
    { value: 'APP_DEVELOPMENT', label: 'App Development' },
    { value: 'AI_SOLUTIONS', label: 'AI Solutions' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'OTHER', label: 'Other' },
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
        }}>Service Inquiries</h1>
        <p style={{
          color: '#a1a1aa',
          margin: 0,
          fontSize: isMobile ? '14px' : '16px'
        }}>Web and app development inquiries</p>
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
            placeholder="Search by inquiry #, name, email, or company..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
          {serviceTypes.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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

      {/* Inquiries List */}
      {loading ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#71717a', margin: 0 }}>Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>No inquiries yet</h3>
          <p style={{ color: '#71717a', margin: 0 }}>
            Service inquiries from the contact form will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '20px 24px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '16px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '18px' }}>{inquiry.inquiryNumber}</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: `${getServiceTypeColor(inquiry.serviceType)}20`,
                      color: getServiceTypeColor(inquiry.serviceType),
                    }}>
                      {getServiceTypeLabel(inquiry.serviceType)}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: `${getStatusColor(inquiry.status)}20`,
                      color: getStatusColor(inquiry.status),
                    }}>
                      {inquiry.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ color: '#a1a1aa', margin: 0, fontSize: '14px' }}>
                    Submitted {formatDate(inquiry.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/admin/inquiries/${inquiry.id}`}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                gap: '16px',
              }}>
                {/* Customer */}
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Customer
                  </p>
                  <p style={{ margin: '0 0 2px 0', fontWeight: 500 }}>{inquiry.name}</p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>{inquiry.email}</p>
                  {inquiry.company && (
                    <p style={{ margin: '2px 0 0 0', color: '#71717a', fontSize: '14px' }}>{inquiry.company}</p>
                  )}
                </div>

                {/* Budget & Timeline */}
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Budget & Timeline
                  </p>
                  <p style={{ margin: '0 0 2px 0' }}>{inquiry.budget || 'Not specified'}</p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
                    {inquiry.timeline || 'Flexible'}
                  </p>
                </div>

                {/* Description Preview */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Description
                  </p>
                  <p style={{
                    margin: 0,
                    color: '#a1a1aa',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {inquiry.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
