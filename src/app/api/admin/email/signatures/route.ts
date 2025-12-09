import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuthInfo } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// GET /api/admin/email/signatures - Get all signatures for the user
export async function GET(req: NextRequest) {
  try {
    const auth = await getAdminAuthInfo(req)
    if (!auth.isAuthorized || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const signatures = await prisma.emailSignature.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ signatures })
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json({ error: 'Failed to fetch signatures' }, { status: 500 })
  }
}

// POST /api/admin/email/signatures - Create a new signature
export async function POST(req: NextRequest) {
  try {
    const auth = await getAdminAuthInfo(req)
    if (!auth.isAuthorized || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, content, isDefault, forAddress } = await req.json()

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 })
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.emailSignature.updateMany({
        where: {
          userId: auth.userId,
          isDefault: true,
          ...(forAddress ? { forAddress } : {}),
        },
        data: { isDefault: false },
      })
    }

    const signature = await prisma.emailSignature.create({
      data: {
        userId: auth.userId,
        name,
        content,
        isDefault: isDefault || false,
        forAddress: forAddress || null,
      },
    })

    return NextResponse.json({ signature, success: true })
  } catch (error) {
    console.error('Error creating signature:', error)
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 })
  }
}
