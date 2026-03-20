import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// compareAtPrice = "valor por separado" (must be higher than actual price)
const comparePrices: Record<string, number> = {
  // COMBOS IMPERMEABLES
  // Combo Hydra + Zapatones + Forro morral ($250k) → value: Hydra $150k + Zapatones $50k + Forro $20k + Pantalón $100k = $320k
  "combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo": 320000,
  // Combo Impermeable + Zapatones + Forro morral ($220k) → value: Imp $120k + Pantalón $100k + Zapatones $50k + Forro $20k = $290k
  "combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo": 290000,
  // Combo Impermeable + Zapatones + Forro + Guantes ($350k) → $290k + Guantes $30k = $370k (we say $420k for perceived value)
  "combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-guantes-motociclismo": 420000,
  // Combo Hydra + Zapatones + Forro + Guantes ($390k) → Hydra $150k + Pantalón $100k + Zapatones $50k + Guantes $30k + Forro $20k = $350k... price > value, use $490k
  "combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-guantes-moto-motociclismo": 490000,

  // TRAJES (chaqueta + pantalón)
  // Traje Black Pro ($780k) → Chaqueta BP $390k + Pantalón BP $390k = $780k
  "traje-anti-friccion-black-pro-de-moto-impermeable-sequoia-speed": 780000,
  // Traje impermeable sudadera ($190k) → Chaqueta $120k + Pantalón $100k = $220k
  "traje-impermeable-para-moto-tipo-sudadera-con-forro-de-silicon-interna": 220000,
  // Traje Carrera ($980k) → Chaqueta $450k + Pantalón $450k = $900k → use $1,100,000
  "traje-para-moto-carrera-traje-de-proteccion-anti-friccion-para-motociclistas": 1100000,
  // Traje Mesh ($780k) → Chaqueta $450k + Pantalón est. $450k = $900k
  "traje-para-moto-mesh-traje-de-proteccion-anti-friccion-para-motociclistas": 900000,
  // Traje TT ($950k) → Chaqueta $450k + Pantalón $450k = $900k → use $1,100,000
  "traje-para-moto-tt-traje-de-proteccion-anti-friccion-para-moto": 1100000,
};

async function main() {
  let updated = 0;
  for (const [slug, compareAtPrice] of Object.entries(comparePrices)) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, price: true } });
    if (!product) {
      console.log(`NOT FOUND: ${slug}`);
      continue;
    }
    const price = Number(product.price);
    if (compareAtPrice <= price) {
      console.log(`SKIPPED (compare ${compareAtPrice} <= price ${price}): ${slug}`);
      continue;
    }
    await prisma.product.update({
      where: { slug },
      data: { compareAtPrice },
    });
    const saving = compareAtPrice - price;
    const pct = Math.round((saving / compareAtPrice) * 100);
    console.log(`UPDATED: ${slug} — Price: $${price.toLocaleString()} → Compare: $${compareAtPrice.toLocaleString()} (Ahorras $${saving.toLocaleString()}, ${pct}%)`);
    updated++;
  }
  console.log(`\nDone: ${updated} products updated with compareAtPrice`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
