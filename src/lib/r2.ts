import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing Cloudflare R2 environment variables')
}

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  file: Buffer | Uint8Array | Blob,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || '47industries-files'

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file as Buffer,
    ContentType: contentType,
  })

  await r2Client.send(command)

  // Return the public URL
  const publicUrl = process.env.R2_PUBLIC_URL || `https://${bucketName}.r2.dev`
  return `${publicUrl}/${key}`
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const bucketName = process.env.R2_BUCKET_NAME || '47industries-files'

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Generate a pre-signed URL for temporary file access
 */
export async function getR2SignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || '47industries-files'

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn })
  return signedUrl
}

/**
 * Generate a unique file key
 */
export function generateFileKey(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')

  if (prefix) {
    return `${prefix}/${timestamp}-${random}-${sanitizedName}`
  }

  return `${timestamp}-${random}-${sanitizedName}`
}
