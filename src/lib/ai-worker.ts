import { Worker, Queue } from "bullmq";
import pool from "@/lib/sequoia-chat-db";

const connection = { host: "localhost", port: 6379 };

// Queue for AI processing
export const aiQueue = new Queue("ai-processing", { connection });

// This worker runs in the same process but processes async
export function startAiWorker() {
  const worker = new Worker("ai-processing", async (job) => {
    const { sessionId, messageText } = job.data;
    
    try {
      // Same logic as processAutoAI but runs async via queue
      const lastMsg = await pool.query(
        "SELECT mensaje, tipo_archivo FROM messages WHERE session_id = $1 AND is_bot = false ORDER BY fecha_creacion DESC LIMIT 1",
        [sessionId]
      );
      if (lastMsg.rows.length > 0) {
        const lt = lastMsg.rows[0].tipo_archivo;
        const lm = lastMsg.rows[0].mensaje || "";
        if (lt === "sticker" || lt === "audio" || lt === "video" || lm === "[Sticker]" || lm.startsWith("[Reaccion:")) {
          return { skipped: true, reason: "media/sticker" };
        }
      }

      // Check if bot already responded
      const lastBotCheck = await pool.query(
        `SELECT 1 FROM messages WHERE session_id = $1 AND is_bot = true 
         AND fecha_creacion > (SELECT MAX(fecha_creacion) FROM messages WHERE session_id = $1 AND is_bot = false)
         LIMIT 1`,
        [sessionId]
      );
      if (lastBotCheck.rows.length > 0) {
        return { skipped: true, reason: "already responded" };
      }

      console.log(`[AI Worker] Processing job ${job.id} for ${sessionId}`);
      return { processed: true, sessionId };
    } catch (error: any) {
      console.error(`[AI Worker] Error:`, error.message);
      throw error; // BullMQ will retry
    }
  }, { 
    connection,
    concurrency: 3, // Process up to 3 AI requests concurrently
    limiter: { max: 10, duration: 60000 }, // Max 10 per minute
  });

  worker.on("completed", (job) => {
    console.log(`[AI Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[AI Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
