'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Generate or retrieve visitor ID from localStorage
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('47i_visitor_id')
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('47i_visitor_id', visitorId)
  }
  return visitorId
}

// Generate or retrieve session ID from sessionStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('47i_session_id')
  if (!sessionId) {
    sessionId = 's_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('47i_session_id', sessionId)
  }
  return sessionId
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPathRef = useRef<string | null>(null)
  const pageLoadTimeRef = useRef<number>(Date.now())
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    const visitorId = getVisitorId()
    const sessionId = getSessionId()

    // Track page view on path change
    if (lastPathRef.current !== pathname) {
      // Send duration for previous page
      if (lastPathRef.current) {
        const duration = Math.round((Date.now() - pageLoadTimeRef.current) / 1000)
        trackPageView(lastPathRef.current, visitorId, sessionId, duration)
      }

      // Reset timer for new page
      pageLoadTimeRef.current = Date.now()
      lastPathRef.current = pathname

      // Track new page view (without duration yet)
      trackPageView(pathname, visitorId, sessionId)
    }

    // Heartbeat to keep session alive (every 30 seconds)
    heartbeatRef.current = setInterval(() => {
      updateSession(sessionId, visitorId, pathname)
    }, 30000)

    // Track duration when user leaves
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - pageLoadTimeRef.current) / 1000)
      // Use sendBeacon for reliable delivery on page unload
      const data = JSON.stringify({
        path: pathname,
        visitorId,
        sessionId,
        duration,
        referrer: document.referrer || null
      })
      navigator.sendBeacon('/api/analytics/track', data)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
    }
  }, [pathname])

  return null
}

async function trackPageView(
  path: string,
  visitorId: string,
  sessionId: string,
  duration?: number
) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        visitorId,
        sessionId,
        duration,
        referrer: document.referrer || null
      })
    })
  } catch (error) {
    // Silently fail - don't break the user experience
  }
}

async function updateSession(sessionId: string, visitorId: string, currentPage: string) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentPage,
        visitorId,
        sessionId,
        heartbeat: true
      })
    })
  } catch (error) {
    // Silently fail
  }
}
