import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";

const CATALOG_KEY = "catalog:text";
const CATALOG_TTL = 86400; // 24 hours

export async function getCatalogText(): Promise<string> {
  // Try cache first
  const cached = await cacheGet<string>(CATALOG_KEY);
  if (cached) return cached;

  // Cache miss — load from Prisma
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, price: true, reference: true, shortDescription: true, slug: true },
    orderBy: { name: "asc" },
  });

  const catalogText = products.map(p =>
    `- ${p.name} (Ref: ${p.reference || "N/A"}) - ${Number(p.price).toLocaleString("es-CO")} pesos. ${p.shortDescription || ""} | URL: https://sequoiaspeed.com.co/producto/${p.slug}`
  ).join("\n");

  // Store in cache
  await cacheSet(CATALOG_KEY, catalogText, CATALOG_TTL);

  return catalogText;
}

export async function invalidateCatalogCache(): Promise<void> {
  const { cacheDelete } = await import("@/lib/redis");
  await cacheDelete(CATALOG_KEY);
}
