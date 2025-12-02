const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:IoOlsZtgeKEPyMcMVPcyAlASLinJYgTq@shuttle.proxy.rlwy.net:11561/railway'
    }
  }
});

async function main() {
  // List all categories
  console.log('=== CATEGORIES ===');
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: true
    },
    orderBy: { name: 'asc' }
  });
  categories.forEach(c => console.log(`ID: ${c.id} | Name: ${c.name} | Slug: ${c.slug} | Products: ${c._count.products} | Parent: ${c.parent?.name || 'None'}`));

  // List all products with their categories
  console.log('\n=== PRODUCTS ===');
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });
  products.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Category: ${p.category.name} | CategoryID: ${p.categoryId}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
