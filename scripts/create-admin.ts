import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'kylerivers'
  const email = 'kyle@47industries.com'
  const password = 'chelsea06'
  const name = 'Kyle Rivers'

  console.log('Creating admin user...')
  console.log('Username:', username)
  console.log('Email:', email)

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  })

  if (existingUser) {
    console.log('Admin user already exists - updating to ensure correct settings...')
    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        username,
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })
    console.log('✅ Admin user updated!')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create the admin user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log('User ID:', user.id)
  console.log('Username:', username)
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('\nLog in at: https://admin.47industries.com')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
