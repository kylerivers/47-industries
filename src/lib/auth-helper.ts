import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import jwt from 'jsonwebtoken'
import { authOptions } from '@/lib/auth'

interface AuthResult {
  isAuthorized: boolean
  userId?: string
  role?: string
}

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const result = await getAdminAuthInfo(request)
  return result.isAuthorized
}

export async function getAdminAuthInfo(request: NextRequest): Promise<AuthResult> {
  // First try NextAuth session (web)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const user = session.user as { id?: string; role?: string }
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    return {
      isAuthorized: isAdmin,
      userId: user.id,
      role: user.role,
    }
  }

  // Then try JWT token (mobile)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'fallback-secret'
      ) as { userId: string; role: string }
      const isAdmin = decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN'
      return {
        isAuthorized: isAdmin,
        userId: decoded.userId,
        role: decoded.role,
      }
    } catch {
      return { isAuthorized: false }
    }
  }
  return { isAuthorized: false }
}
