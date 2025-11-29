'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube } from '@fortawesome/free-solid-svg-icons'

interface CustomRequest {
  id: string
  requestNumber: string
  name: string
  email: string
  phone?: string
  company?: string
  fileUrl: string
  fileName: string
  fileSize: number
  material: string
  finish: string
  color: string
  quantity: number
  dimensions?: string
  scale?: number
  notes?: string
  deadline?: string
  estimatedPrice?: number
  estimatedDays?: number
  quoteNotes?: string
  quotedAt?: string
  quotedBy?: string
  status: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<CustomRequest[]>([])
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
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/custom-requests?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRequests()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: '#f59e0b',
      REVIEWING: '#3b82f6',
      QUOTED: '#8b5cf6',
      APPROVED: '#10b981',
      IN_PRODUCTION: '#f59e0b',
      COMPLETED: '#10b981',
      CANCELLED: '#ef4444',
    }
    return colors[status] || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const statuses = [
    { value: 'all', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REVIEWING', label: 'Reviewing' },
    { value: 'QUOTED', label: 'Quoted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'IN_PRODUCTION', label: 'In Production' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
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
        }}>3D Print Requests</h1>
        <p style={{
          color: '#a1a1aa',
          margin: 0,
          fontSize: isMobile ? '14px' : '16px'
        }}>Manage custom 3D printing quote requests</p>
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
            placeholder="Search by request #, name, email, or material..."
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

      {/* Requests List */}
      {loading ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#71717a', margin: 0 }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#71717a' }}>
            <FontAwesomeIcon icon={faCube} />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>No requests yet</h3>
          <p style={{ color: '#71717a', margin: 0 }}>
            Custom 3D printing requests will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((request) => (
            <div
              key={request.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '18px' }}>{request.requestNumber}</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: `${getStatusColor(request.status)}20`,
                      color: getStatusColor(request.status),
                    }}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ color: '#a1a1aa', margin: 0, fontSize: '14px' }}>
                    Submitted {formatDate(request.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/admin/custom-requests/${request.id}`}
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
                  <p style={{ margin: '0 0 2px 0', fontWeight: 500 }}>{request.name}</p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>{request.email}</p>
                </div>

                {/* Material & Specs */}
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Specifications
                  </p>
                  <p style={{ margin: '0 0 2px 0' }}>{request.material}</p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
                    {request.finish} • {request.color}
                  </p>
                </div>

                {/* Quantity & File */}
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Quantity & File
                  </p>
                  <p style={{ margin: '0 0 2px 0' }}>Qty: {request.quantity}</p>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
                    {request.fileName} ({formatFileSize(request.fileSize)})
                  </p>
                </div>

                {/* Quote */}
                <div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Quote
                  </p>
                  {request.estimatedPrice ? (
                    <>
                      <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#10b981' }}>
                        ${Number(request.estimatedPrice).toFixed(2)}
                      </p>
                      <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
                        {request.estimatedDays} days
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, color: '#71717a', fontStyle: 'italic' }}>Not quoted</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
