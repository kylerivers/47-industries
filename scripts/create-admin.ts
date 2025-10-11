import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'admin@47industries.com'
  const password = process.argv[3] || 'admin123'
  const name = process.argv[4] || 'Admin User'

  console.log('Creating admin user...')
  console.log('Email:', email)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('❌ User already exists with this email')
    process.exit(1)
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the admin user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log('User ID:', user.id)
  console.log('Email:', user.email)
  console.log('Password:', password)
  console.log('\nYou can now log in at: http://localhost:3000/admin/login')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
