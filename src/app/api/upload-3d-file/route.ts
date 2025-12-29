import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, generateFileKey, isR2Configured } from '@/lib/r2'

// Public endpoint for customer 3D printing file uploads
export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured) {
      return NextResponse.json(
        { error: 'File upload is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - only 3D file formats
    const validExtensions = ['.stl', '.obj', '.step', '.stp']
    const fileName = file.name.toLowerCase()
    const isValid = validExtensions.some(ext => fileName.endsWith(ext))

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .STL, .OBJ, and .STEP files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for 3D files)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique key with custom-requests folder prefix
    const key = generateFileKey(file.name, 'custom-requests')

    // Determine content type based on file extension
    const contentTypeMap: Record<string, string> = {
      '.stl': 'model/stl',
      '.obj': 'model/obj',
      '.step': 'model/step',
      '.stp': 'model/step',
    }
    const ext = fileName.substring(fileName.lastIndexOf('.'))
    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    // Upload to R2
    const url = await uploadToR2(key, buffer, contentType)

    return NextResponse.json({
      url,
      key,
      folder: 'custom-requests',
      size: file.size,
      type: contentType,
      name: file.name,
    })
  } catch (error) {
    console.error('Error uploading 3D file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}
