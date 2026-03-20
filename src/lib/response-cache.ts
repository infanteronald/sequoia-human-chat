import crypto from "crypto";
import { cacheGet, cacheSet, cacheIncr } from "@/lib/redis";

const CACHE_TTL_FAQ = 14400;     // 4 hours for FAQ
const CACHE_TTL_PRODUCT = 7200;  // 2 hours for product queries

function hashQuestion(text: string): string {
  // Normalize: lowercase, remove accents, remove punctuation, sort words
  const normalized = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1)
    .sort()
    .join(" ");
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export async function getCachedResponse(question: string): Promise<string | null> {
  const hash = hashQuestion(question);
  const cached = await cacheGet<{ response: string; model: string }>(`resp:${hash}`);
  if (cached) {
    await cacheIncr("stats:cache_hits");
    return cached.response;
  }
  await cacheIncr("stats:cache_misses");
  return null;
}

export async function setCachedResponse(question: string, response: string, model: string, isFaq: boolean = false): Promise<void> {
  // Don't cache if response contains specific user context markers
  if (response.includes("don ") || response.includes("doña ") || response.includes("señor ") || response.includes("señora ")) {
    // Still cache but with shorter TTL since it's personalized
  }
  
  const hash = hashQuestion(question);
  const ttl = isFaq ? CACHE_TTL_FAQ : CACHE_TTL_PRODUCT;
  await cacheSet(`resp:${hash}`, { response, model, timestamp: Date.now() }, ttl);
}

export async function getCacheStats(): Promise<{ hits: number; misses: number; hitRate: string }> {
  const hits = parseInt(await cacheGet<string>("stats:cache_hits") || "0");
  const misses = parseInt(await cacheGet<string>("stats:cache_misses") || "0");
  const total = hits + misses;
  const hitRate = total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : "0%";
  return { hits, misses, hitRate };
}
