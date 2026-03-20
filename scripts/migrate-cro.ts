import { PrismaClient } from "@prisma/client";
import { productCROConfig } from "../src/lib/product-cro-config";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  for (const [slug, config] of Object.entries(productCROConfig)) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) {
      console.log(`NOT FOUND: ${slug}`);
      continue;
    }
    await prisma.product.update({
      where: { slug },
      data: {
        subtitle: config.subtitle,
        benefits: config.benefits as any,
        reviews: config.reviews as any,
        faq: config.faq as any,
      },
    });
    console.log(`UPDATED: ${slug}`);
    updated++;
  }
  console.log(`\nDone: ${updated} products updated with CRO data`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
