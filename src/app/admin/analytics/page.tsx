'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues with Leaflet
const ActiveUsersMap = dynamic(
  () => import('@/components/analytics/ActiveUsersMap'),
  { ssr: false, loading: () => <div style={{ height: '400px', background: '#1a1a1a', borderRadius: '12px' }} /> }
)

interface ActiveSession {
  id: string
  currentPage: string | null
  lastActive: string
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

interface AnalyticsData {
  activeUsers: number
  activeSessions: ActiveSession[]
  totalPageViews: number
  uniqueVisitors: number
  uniqueSessions: number
  topPages: { path: string; views: number }[]
  deviceStats: { device: string; count: number }[]
  browserStats: { browser: string; count: number }[]
  pageViewsByDay: { date: string; views: number }[]
  referrerStats: { referrer: string; count: number }[]
  abandonedCarts: {
    count: number
    totalValue: number
    items: any[]
  }
  period: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchAnalytics()
    // Refresh active users every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const periodOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ]

  const maxViews = data?.pageViewsByDay ? Math.max(...data.pageViewsByDay.map(d => d.views), 1) : 1

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            Analytics
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
            Site traffic and visitor insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                background: period === opt.value ? '#3b82f6' : '#27272a',
                color: '#fff',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a1a1aa' }}>
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <MetricCard
              label="Active Now"
              value={data?.activeUsers || 0}
              color="#10b981"
              live
            />
            <MetricCard
              label="Page Views"
              value={data?.totalPageViews || 0}
              color="#3b82f6"
            />
            <MetricCard
              label="Unique Visitors"
              value={data?.uniqueVisitors || 0}
              color="#8b5cf6"
            />
            <MetricCard
              label="Sessions"
              value={data?.uniqueSessions || 0}
              color="#f59e0b"
            />
          </div>

          {/* Live Visitors Map */}
          <div style={{ marginBottom: '24px' }}>
            <ActiveUsersMap
              sessions={data?.activeSessions || []}
              onRefresh={fetchAnalytics}
            />
          </div>

          {/* Abandoned Carts Alert */}
          {data?.abandonedCarts && data.abandonedCarts.count > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
                  {data.abandonedCarts.count} Abandoned Cart{data.abandonedCarts.count !== 1 ? 's' : ''}
                </div>
                <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                  Potential revenue: ${Number(data.abandonedCarts.totalValue).toFixed(2)}
                </div>
              </div>
              <button style={{
                padding: '8px 16px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px'
              }}>
                View Carts
              </button>
            </div>
          )}

          {/* Chart and Top Pages */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Page Views Chart */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                Page Views Over Time
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px' }}>
                {data?.pageViewsByDay?.map((day, i) => (
                  <div
                    key={day.date}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                        borderRadius: '4px 4px 0 0',
                        height: `${(day.views / maxViews) * 160}px`,
                        minHeight: day.views > 0 ? '4px' : '0',
                        transition: 'height 0.3s'
                      }}
                      title={`${day.date}: ${day.views} views`}
                    />
                    {!isMobile && data.pageViewsByDay.length <= 14 && (
                      <span style={{ fontSize: '10px', color: '#71717a' }}>
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Top Pages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.topPages?.slice(0, 8).map((page, i) => (
                  <div key={page.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#a1a1aa',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%'
                    }}>
                      {page.path === '/' ? 'Homepage' : page.path}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>
                      {page.views.toLocaleString()}
                    </span>
                  </div>
                ))}
                {(!data?.topPages || data.topPages.length === 0) && (
                  <p style={{ color: '#71717a', fontSize: '13px' }}>No page data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Device & Browser Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Devices */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Devices
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.deviceStats?.map(device => {
                  const total = data.deviceStats.reduce((sum, d) => sum + d.count, 0)
                  const pct = total > 0 ? Math.round((device.count / total) * 100) : 0
                  return (
                    <div key={device.device}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{device.device}</span>
                        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#27272a', borderRadius: '3px' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: device.device === 'desktop' ? '#3b82f6' : device.device === 'mobile' ? '#10b981' : '#f59e0b',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  )
                })}
                {(!data?.deviceStats || data.deviceStats.length === 0) && (
                  <p style={{ color: '#71717a', fontSize: '13px' }}>No device data yet</p>
                )}
              </div>
            </div>

            {/* Browsers */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Browsers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.browserStats?.map(browser => (
                  <div key={browser.browser} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px' }}>{browser.browser}</span>
                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{browser.count.toLocaleString()}</span>
                  </div>
                ))}
                {(!data?.browserStats || data.browserStats.length === 0) && (
                  <p style={{ color: '#71717a', fontSize: '13px' }}>No browser data yet</p>
                )}
              </div>
            </div>

            {/* Referrers */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Traffic Sources
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.referrerStats?.map(ref => (
                  <div key={ref.referrer} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ref.referrer || 'Direct'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{ref.count.toLocaleString()}</span>
                  </div>
                ))}
                {(!data?.referrerStats || data.referrerStats.length === 0) && (
                  <p style={{ color: '#71717a', fontSize: '13px' }}>No referrer data yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, color, live }: { label: string; value: number; color: string; live?: boolean }) {
  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      border: '1px solid #27272a',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{label}</span>
        {live && (
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            animation: 'pulse 2s infinite'
          }} />
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700', color }}>
        {value.toLocaleString()}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
