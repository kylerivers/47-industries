import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Check authentication for admin routes (except login page)
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token || token.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

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
      const response = NextResponse.rewrite(url)
      response.headers.set('x-pathname', url.pathname)
      return response
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

  // Add pathname header for all requests
  const response = NextResponse.next()
  response.headers.set('x-pathname', url.pathname)
  return response
}
