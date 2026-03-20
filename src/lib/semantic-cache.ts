import { generateEmbedding } from "@/lib/embeddings";
import pool from "@/lib/sequoia-chat-db";

// Create cache table if needed (run once)
async function ensureCacheTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS response_cache (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      response TEXT NOT NULL,
      embedding vector(1536),
      hit_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '4 hours'
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_rc_embedding ON response_cache USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)");
}

let tableReady = false;

export async function getCachedResponse(question: string, threshold: number = 0.92): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!tableReady) { await ensureCacheTable().catch(() => {}); tableReady = true; }

  try {
    const embedding = await generateEmbedding(question);
    const result = await pool.query(
      `SELECT response, 1 - (embedding <=> $1::vector) as similarity
       FROM response_cache
       WHERE expires_at > NOW()
       ORDER BY embedding <=> $1::vector
       LIMIT 1`,
      [`[${embedding.join(",")}]`]
    );

    if (result.rows.length > 0 && result.rows[0].similarity >= threshold) {
      // Update hit count
      pool.query("UPDATE response_cache SET hit_count = hit_count + 1 WHERE id = (SELECT id FROM response_cache ORDER BY embedding <=> $1::vector LIMIT 1)", [`[${embedding.join(",")}]`]).catch(() => {});
      return result.rows[0].response;
    }
    return null;
  } catch { return null; }
}

export async function setCachedResponse(question: string, response: string, ttlHours: number = 4): Promise<void> {
  if (!process.env.OPENAI_API_KEY) return;
  if (!tableReady) { await ensureCacheTable().catch(() => {}); tableReady = true; }

  try {
    const embedding = await generateEmbedding(question);
    await pool.query(
      `INSERT INTO response_cache (question, response, embedding, expires_at)
       VALUES ($1, $2, $3::vector, NOW() + INTERVAL '${ttlHours} hours')`,
      [question, response, `[${embedding.join(",")}]`]
    );
  } catch (e) { console.error("[Semantic Cache Set]", e); }
}
