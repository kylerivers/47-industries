import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating MotoRev project...')

  // Remove incorrect brand color (user said red is wrong)
  const updated = await prisma.serviceProject.update({
    where: { slug: 'motorev' },
    data: {
      accentColor: null, // Remove brand color - use default 47 Industries blue
    },
  })

  console.log('✓ MotoRev updated:', updated.title)
  console.log('  - Removed incorrect brand color')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
