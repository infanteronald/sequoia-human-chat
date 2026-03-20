import OpenAI from "openai";
import pool from "@/lib/sequoia-chat-db";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return res.data[0].embedding;
}

// Embed a KB article and save to DB
export async function embedKBArticle(id: number): Promise<void> {
  const article = await pool.query("SELECT title, content FROM knowledge_base WHERE id = $1", [id]);
  if (article.rows.length === 0) return;
  const text = `${article.rows[0].title}\n${article.rows[0].content}`;
  const embedding = await generateEmbedding(text);
  await pool.query(
    "UPDATE knowledge_base SET embedding = $1 WHERE id = $2",
    [`[${embedding.join(",")}]`, id]
  );
}

// Embed all KB articles that don't have embeddings yet
export async function embedAllKB(): Promise<number> {
  const articles = await pool.query("SELECT id FROM knowledge_base WHERE embedding IS NULL AND enabled = true");
  let count = 0;
  for (const row of articles.rows) {
    try {
      await embedKBArticle(row.id);
      count++;
    } catch (e) { console.error(`[Embed] Failed for KB ${row.id}:`, e); }
  }
  return count;
}

// Search KB by semantic similarity — returns top K most relevant articles
export async function searchKB(query: string, topK: number = 5): Promise<{ id: number; title: string; content: string; similarity: number }[]> {
  const queryEmbedding = await generateEmbedding(query);
  const result = await pool.query(
    `SELECT id, title, content, 1 - (embedding <=> $1::vector) as similarity
     FROM knowledge_base
     WHERE enabled = true AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [`[${queryEmbedding.join(",")}]`, topK]
  );
  return result.rows;
}
