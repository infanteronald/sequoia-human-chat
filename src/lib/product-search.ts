import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";

interface ProductResult {
  name: string;
  price: number;
  reference: string | null;
  shortDescription: string | null;
  slug: string;
  score: number;
}

// Synonym map for Colombian Spanish motorcycle gear queries
const SYNONYMS: Record<string, string[]> = {
  "lluvia": ["impermeable", "storm", "waterproof"],
  "agua": ["impermeable", "storm"],
  "frio": ["chaqueta", "cortaviento"],
  "proteccion": ["certificadas", "ce", "protecciones"],
  "moto": ["motociclista", "motorizado"],
  "barato": ["economico", "precio"],
  "caro": ["premium", "alta gama"],
  "seguridad": ["protecciones", "certificadas"],
  "conjunto": ["combo", "traje"],
  "traje": ["combo", "conjunto"],
};

function expandQuery(query: string): string {
  let expanded = query.toLowerCase();
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (expanded.includes(key)) {
      expanded += " " + synonyms.join(" ");
    }
  }
  return expanded;
}

export async function searchProducts(query: string, topK: number = 5): Promise<ProductResult[]> {
  if (!query || query.trim().length < 3) return [];

  // Check Redis cache
  const cacheKey = `psearch:${query.toLowerCase().trim().slice(0, 50)}`;
  const cached = await cacheGet<ProductResult[]>(cacheKey);
  if (cached) return cached;

  const expandedQuery = expandQuery(query);

  try {
    // Use Prisma raw query for full-text + trigram search
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT name, price, reference, "shortDescription", slug,
        (
          ts_rank(to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce("shortDescription",'') || ' ' || coalesce(description,'')), 
                  plainto_tsquery('spanish', $1)) * 10 +
          similarity(lower(name), lower($2)) * 5 +
          CASE WHEN lower(name) LIKE '%' || lower($2) || '%' THEN 3 ELSE 0 END
        ) as score
      FROM "Product"
      WHERE "isActive" = true
        AND (
          to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce("shortDescription",'') || ' ' || coalesce(description,'')) 
          @@ plainto_tsquery('spanish', $1)
          OR similarity(lower(name), lower($2)) > 0.15
          OR lower(name) LIKE '%' || lower($2) || '%'
          OR lower("shortDescription") LIKE '%' || lower($2) || '%'
        )
      ORDER BY score DESC
      LIMIT $3
    `, expandedQuery, query.trim(), topK);

    const products: ProductResult[] = results.map(r => ({
      name: r.name,
      price: Number(r.price),
      reference: r.reference,
      shortDescription: r.shortDescription,
      slug: r.slug,
      score: Number(r.score),
    }));

    if (products.length > 0) {
      await cacheSet(cacheKey, products, 3600);
    }

    return products;
  } catch (e) {
    console.error("[Product Search]", e);
    // Fallback to simple keyword search
    return fallbackSearch(query, topK);
  }
}

// Fallback: in-memory keyword search
async function fallbackSearch(query: string, topK: number): Promise<ProductResult[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, price: true, reference: true, shortDescription: true, slug: true },
  });

  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  return products
    .map(p => {
      const text = `${p.name} ${p.shortDescription || ""}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score += kw.length;
      }
      return { ...p, price: Number(p.price), score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function formatProductsForPrompt(products: ProductResult[]): string {
  if (products.length === 0) return "";
  return products.map(p =>
    `- ${p.name} (Ref: ${p.reference || "N/A"}) - ${p.price.toLocaleString("es-CO")} pesos. ${p.shortDescription || ""} | URL: https://sequoiaspeed.com.co/producto/${p.slug}`
  ).join("\n");
}
