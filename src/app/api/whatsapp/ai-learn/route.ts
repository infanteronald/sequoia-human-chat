import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, aiSuggestion, finalMessage, correctionType, customerQuestion } = await req.json();

    if (!sessionId || !aiSuggestion) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO ai_learning (session_id, ai_suggestion, final_message, correction_type, customer_question)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, aiSuggestion, finalMessage || "", correctionType || "pending", customerQuestion || null]
    );

    // Resolution Learning Loop: auto-create KB entry from corrections
    if ((correctionType === "modified" || correctionType === "learned") && customerQuestion && finalMessage) {
      try {
        // Check if similar Q&A already exists in KB
        const existing = await pool.query(
          "SELECT id FROM knowledge_base WHERE title LIKE $1 LIMIT 1",
          [`FAQ: ${customerQuestion.substring(0, 60)}%`]
        );
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO knowledge_base (title, content, source_type, category, tokens_estimate)
             VALUES ($1, $2, 'manual', 'Aprendido', $3)`,
            [
              `FAQ: ${customerQuestion.substring(0, 80)}`,
              `Pregunta del cliente: ${customerQuestion}\nRespuesta correcta: ${finalMessage}`,
              Math.ceil((customerQuestion.length + finalMessage.length) / 4),
            ]
          );
          console.log("[Learning Loop] Auto-learned from correction:", customerQuestion.substring(0, 50));
        }
      } catch (e) { console.error("[Learning Loop]", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[AI Learn Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
