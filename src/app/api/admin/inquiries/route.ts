import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helper'

import { prisma } from '@/lib/prisma'

// GET /api/admin/inquiries - List all service inquiries
export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await verifyAdminAuth(req)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const serviceType = searchParams.get('serviceType') || ''
    const inquiryType = searchParams.get('inquiryType') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    // Filter by inquiry type (contact forms only)
    if (inquiryType === 'contact') {
      where.inquiryNumber = { startsWith: 'CONTACT-' }
    }

    if (search) {
      where.OR = [
        { inquiryNumber: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (serviceType && serviceType !== 'all') {
      where.serviceType = serviceType
    }

    const [inquiries, total] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.serviceInquiry.count({ where }),
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
