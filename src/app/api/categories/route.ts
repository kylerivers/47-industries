import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories - List active categories (public)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
