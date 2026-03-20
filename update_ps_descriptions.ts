import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

interface PSProduct {
  id_product: number;
  name: string;
  description: string;
  description_short: string;
}

async function main() {
  const psData: PSProduct[] = JSON.parse(
    fs.readFileSync("./ps_descriptions.json", "utf-8")
  );

  console.log(`Loaded ${psData.length} PrestaShop descriptions`);

  let updated = 0;
  let notFound = 0;

  for (const ps of psData) {
    // Find Next.js product by prestashopId
    const product = await prisma.product.findFirst({
      where: { prestashopId: ps.id_product },
      select: { id: true, slug: true, name: true, description: true, shortDescription: true },
    });

    if (!product) {
      console.log(`NOT FOUND: PS ID ${ps.id_product} - ${ps.name}`);
      notFound++;
      continue;
    }

    const updateData: Record<string, string> = {};

    // Set shortDescription from PS description_short (main marketing text)
    if (ps.description_short && ps.description_short.trim()) {
      updateData.shortDescription = ps.description_short.trim();
    }

    // Set description from PS description (features/specs block)
    if (ps.description && ps.description.trim()) {
      updateData.description = ps.description.trim();
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
      updated++;
      console.log(`UPDATED: ${product.slug} (PS ID ${ps.id_product}) - short: ${(updateData.shortDescription || '').length} chars, desc: ${(updateData.description || '').length} chars`);
    } else {
      console.log(`SKIPPED (no content): ${product.slug}`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
