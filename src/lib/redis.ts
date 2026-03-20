import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const PREFIX = "sequoia:";

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (err) => {
  console.error("[Redis Error]", err.message);
});

export async function cacheGet<T = string>(key: string): Promise<T | null> {
  try {
    const val = await redis.get(PREFIX + key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return val as T; }
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    await redis.set(PREFIX + key, serialized, "EX", ttlSeconds);
  } catch (e) { console.error("[Redis Set]", e); }
}

export async function cacheDelete(key: string): Promise<void> {
  try { await redis.del(PREFIX + key); } catch {}
}

export async function cacheIncr(key: string): Promise<number> {
  try { return await redis.incr(PREFIX + key); } catch { return 0; }
}

export default redis;
export { PREFIX };
