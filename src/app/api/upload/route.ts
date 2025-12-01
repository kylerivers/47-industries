import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2, generateFileKey, isR2Configured } from '@/lib/r2'

// Valid folder categories for file uploads
const VALID_FOLDERS = [
  'products',      // Shop product images
  'projects',      // Portfolio/service project images
  'avatars',       // User profile pictures
  'blog',          // Blog post images
  'logos',         // Client logos, brand assets
  'misc',          // Miscellaneous uploads
] as const

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isR2Configured) {
      return NextResponse.json(
        { error: 'File upload is not configured. Please set up Cloudflare R2 credentials.' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'misc'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate folder
    const uploadFolder = VALID_FOLDERS.includes(folder as any) ? folder : 'misc'

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique key with folder prefix
    const key = generateFileKey(file.name, uploadFolder)

    // Upload to R2
    const url = await uploadToR2(key, buffer, file.type)

    return NextResponse.json({
      url,
      key,
      folder: uploadFolder,
      size: file.size,
      type: file.type,
      name: file.name,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
