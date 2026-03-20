import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

interface ABVariant {
  id: string;
  prompt: string;
  impressions: number;
  conversions: number;
}

// Get active A/B test variant for a question type
export async function getABVariant(questionType: string): Promise<string | null> {
  const test = await cacheGet<{ variants: ABVariant[]; active: boolean }>(`ab:${questionType}`);
  if (!test || !test.active || test.variants.length < 2) return null;
  
  // Simple round-robin selection
  const counter = await cacheIncr(`ab:${questionType}:counter`);
  const selectedIdx = counter % test.variants.length;
  const variant = test.variants[selectedIdx];
  
  // Track impression
  await cacheIncr(`ab:${questionType}:${variant.id}:impressions`);
  
  return variant.prompt;
}

// Track conversion for a variant
export async function trackABConversion(questionType: string, variantId: string): Promise<void> {
  await cacheIncr(`ab:${questionType}:${variantId}:conversions`);
}

// Create a new A/B test
export async function createABTest(questionType: string, variants: { id: string; prompt: string }[]): Promise<void> {
  const test = {
    active: true,
    variants: variants.map(v => ({ ...v, impressions: 0, conversions: 0 })),
    createdAt: Date.now(),
  };
  await cacheSet(`ab:${questionType}`, test, 86400 * 30); // 30 days
}

// Get A/B test results
export async function getABResults(questionType: string): Promise<ABVariant[] | null> {
  const test = await cacheGet<{ variants: ABVariant[] }>(`ab:${questionType}`);
  if (!test) return null;
  
  const results: ABVariant[] = [];
  for (const v of test.variants) {
    const impressions = parseInt(await cacheGet<string>(`ab:${questionType}:${v.id}:impressions`) || "0");
    const conversions = parseInt(await cacheGet<string>(`ab:${questionType}:${v.id}:conversions`) || "0");
    results.push({ ...v, impressions, conversions });
  }
  return results;
}
