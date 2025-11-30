'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

interface ActiveUsersMapProps {
  sessions: ActiveSession[]
  onRefresh?: () => void
}

export default function ActiveUsersMap({ sessions, onRefresh }: ActiveUsersMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null)

  // Filter sessions with valid coordinates
  const sessionsWithLocation = sessions.filter(
    s => s.latitude !== null && s.longitude !== null
  )

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0], // Center of the world
        zoom: 2,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true
      })

      // Use dark theme tiles from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each session
    sessionsWithLocation.forEach(session => {
      if (!mapInstanceRef.current || session.latitude === null || session.longitude === null) return

      // Create custom icon with pulsing effect
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background: #3b82f6;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
            animation: pulse 2s infinite;
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const marker = L.marker([session.latitude, session.longitude], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="
            background: #1a1a1a;
            color: #ffffff;
            padding: 12px;
            border-radius: 8px;
            min-width: 180px;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="font-weight: 600; margin-bottom: 8px; color: #3b82f6;">
              ${session.city || 'Unknown City'}${session.region ? `, ${session.region}` : ''}
            </div>
            <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 4px;">
              ${session.country || 'Unknown Country'}
            </div>
            <div style="
              font-size: 11px;
              color: #71717a;
              border-top: 1px solid #27272a;
              padding-top: 8px;
              margin-top: 8px;
            ">
              Viewing: ${session.currentPage || '/'}
            </div>
          </div>
        `, {
          className: 'dark-popup'
        })
        .on('click', () => setSelectedSession(session))

      markersRef.current.push(marker)
    })

    // Fit bounds if there are sessions
    if (sessionsWithLocation.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        sessionsWithLocation.map(s => [s.latitude!, s.longitude!] as [number, number])
      )
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 })
    }

    // Cleanup on unmount
    return () => {
      // Don't destroy the map on re-render, only on unmount
    }
  }, [sessions])

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      border: '1px solid #27272a',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #27272a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            Live Visitors Map
          </h3>
          <p style={{ fontSize: '13px', color: '#71717a' }}>
            {sessionsWithLocation.length} active {sessionsWithLocation.length === 1 ? 'user' : 'users'} with location data
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              padding: '8px 16px',
              background: '#27272a',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          height: '400px',
          width: '100%',
          background: '#0a0a0a'
        }}
      />

      {/* Active Sessions List */}
      {sessionsWithLocation.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #27272a',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px' }}>
            Active Sessions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessionsWithLocation.map(session => (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: selectedSession?.id === session.id ? '#27272a' : '#0f0f0f',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => {
                  setSelectedSession(session)
                  if (mapInstanceRef.current && session.latitude && session.longitude) {
                    mapInstanceRef.current.setView([session.latitude, session.longitude], 8)
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s infinite'
                  }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>
                      {session.city || 'Unknown'}{session.region ? `, ${session.region}` : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>
                      {session.country || 'Unknown Country'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    {session.currentPage || '/'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#52525b' }}>
                    {getTimeAgo(new Date(session.lastActive))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Location Data Message */}
      {sessions.length > 0 && sessionsWithLocation.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#71717a'
        }}>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            Location data not available for current sessions
          </p>
          <p style={{ fontSize: '12px' }}>
            Geolocation is determined by visitor IP addresses
          </p>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#71717a'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            No active visitors right now
          </p>
          <p style={{ fontSize: '12px' }}>
            Visitors will appear on the map in real-time
          </p>
        </div>
      )}

      {/* CSS for animations and popup styling */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }

        .dark-popup .leaflet-popup-content {
          margin: 0;
        }

        .dark-popup .leaflet-popup-tip {
          background: #1a1a1a;
        }

        .custom-marker {
          background: transparent;
          border: none;
        }

        .leaflet-control-zoom a {
          background: #27272a !important;
          color: #ffffff !important;
          border-color: #3f3f46 !important;
        }

        .leaflet-control-zoom a:hover {
          background: #3f3f46 !important;
        }

        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.7) !important;
          color: #71717a !important;
        }

        .leaflet-control-attribution a {
          color: #a1a1aa !important;
        }
      `}</style>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 120) return '1 min ago'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`

  return 'Over an hour ago'
}
