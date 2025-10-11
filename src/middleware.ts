import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Force HTTPS redirect in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${hostname}${url.pathname}`,
      301
    )
  }

  // Handle admin subdomain
  if (hostname.startsWith('admin.')) {
    // If on admin subdomain, redirect to /admin path
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = '/admin' + url.pathname
      return NextResponse.rewrite(url)
    }
  }

  // Redirect /admin to admin subdomain in production
  if (
    process.env.NODE_ENV === 'production' &&
    url.pathname.startsWith('/admin') &&
    !hostname.startsWith('admin.')
  ) {
    const adminUrl = new URL(request.url)
    adminUrl.host = `admin.${hostname}`
    return NextResponse.redirect(adminUrl, 301)
  }

  return NextResponse.next()
}
