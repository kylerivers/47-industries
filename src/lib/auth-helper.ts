import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import jwt from 'jsonwebtoken'

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  // First try NextAuth session (web)
  const session = await getServerSession()
  if (session) return true

  // Then try JWT token (mobile)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'fallback-secret'
      ) as { userId: string; role: string }
      return decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN'
    } catch {
      return false
    }
  }
  return false
}
