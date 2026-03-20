import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Generating redirect map...");

  const redirects: Record<string, string> = {};

  // 1. Category redirects: /{prestashopId}-{slug} → /categoria/{newSlug}
  const categories = await prisma.category.findMany({
    where: { prestashopId: { not: null } },
    select: { slug: true, prestashopId: true },
  });

  for (const cat of categories) {
    // PrestaShop pattern: /71-chaquetas
    redirects[`${cat.prestashopId}-${cat.slug}`] = `/categoria/${cat.slug}`;
  }

  // 2. Product redirects: /{prestashopId}-{slug}.html → /producto/{newSlug}
  const products = await prisma.product.findMany({
    where: { prestashopId: { not: null } },
    select: { slug: true, prestashopId: true },
  });

  for (const prod of products) {
    redirects[`${prod.prestashopId}-${prod.slug}`] = `/producto/${prod.slug}`;
  }

  // 3. Static redirects
  redirects["iniciar-sesion"] = "/login";
  redirects["sequoia-speed-colombia-indumentaria-para-moto"] = "/";
  redirects["content/1-delivery"] = "/";
  redirects["content/2-legal-notice"] = "/";
  redirects["content/category/1-inicio"] = "/";

  const outputPath = path.join(process.cwd(), "src/lib/redirects.json");
  fs.writeFileSync(outputPath, JSON.stringify(redirects, null, 2));

  console.log(`Generated ${Object.keys(redirects).length} redirects → ${outputPath}`);

  // Also generate a lookup map by prestashopId for the middleware
  const idMap: { categories: Record<number, string>; products: Record<number, string> } = {
    categories: {},
    products: {},
  };

  for (const cat of categories) {
    idMap.categories[cat.prestashopId!] = cat.slug;
  }

  for (const prod of products) {
    idMap.products[prod.prestashopId!] = prod.slug;
  }

  const idMapPath = path.join(process.cwd(), "src/lib/redirect-ids.json");
  fs.writeFileSync(idMapPath, JSON.stringify(idMap, null, 2));

  console.log(`Generated ID map (${categories.length} cats, ${products.length} prods) → ${idMapPath}`);

  await prisma.$disconnect();
}

main().catch(console.error);
