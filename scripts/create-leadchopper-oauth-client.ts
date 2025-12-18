/**
 * Script to create OAuth client for LeadChopper
 */
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🔐 Creating OAuth client for LeadChopper...\n')

  const clientId = crypto.randomBytes(16).toString('hex')
  const clientSecret = crypto.randomBytes(32).toString('hex')

  const app = await prisma.oAuthApplication.create({
    data: {
      name: 'LeadChopper',
      clientId,
      clientSecret,
      redirectUris: [
        'https://leadchopper.47industries.com/api/auth/callback/47industries',
        'http://localhost:3000/api/auth/callback/47industries', // For local dev
      ],
      active: true,
      description: 'Lead generation and management platform',
    },
  })

  console.log('✅ OAuth client created successfully!\n')
  console.log('Application ID:', app.id)
  console.log('Client ID:', clientId)
  console.log('Client Secret:', clientSecret)
  console.log('\n📋 Add these to LeadChopper .env file:\n')
  console.log(`OAUTH_47IND_CLIENT_ID="${clientId}"`)
  console.log(`OAUTH_47IND_CLIENT_SECRET="${clientSecret}"`)
  console.log(`OAUTH_47IND_ISSUER="https://admin.47industries.com"`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
