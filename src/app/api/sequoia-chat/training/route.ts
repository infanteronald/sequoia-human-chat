import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7d";
    // Allowlist to prevent SQL injection
    const ALLOWED_INTERVALS: Record<string, string> = {
      "7d": "7 days",
      "30d": "30 days",
    };
    const interval = ALLOWED_INTERVALS[period] || "7 days";

    // 1. Questions the bot couldn't answer (__NO_SE__)
    const unknownQuestions = await pool.query(`
      SELECT m2.mensaje as question, m2.session_id, c.nombre, m2.fecha_creacion
      FROM messages m
      JOIN messages m2 ON m2.session_id = m.session_id 
        AND m2.is_bot = false 
        AND m2.fecha_creacion < m.fecha_creacion
        AND m2.fecha_creacion > m.fecha_creacion - INTERVAL '5 minutes'
      JOIN contacts c ON c.session_id = m.session_id
      WHERE m.mensaje LIKE '%Permítame consultar%'
        AND m.fecha_creacion > NOW() - INTERVAL '${interval}'
      ORDER BY m.fecha_creacion DESC
      LIMIT 20
    `);

    // 2. Corrections made by advisors (from ai_learning)
    const corrections = await pool.query(`
      SELECT customer_question, ai_suggestion, final_message, agent_name, created_at
      FROM ai_learning
      WHERE correction_type = 'modified'
        AND created_at > NOW() - INTERVAL '${interval}'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    // 3. Most common topics where bot responded
    const topTopics = await pool.query(`
      SELECT 
        CASE 
          WHEN lower(m.mensaje) LIKE '%impermeable%' THEN 'Impermeables'
          WHEN lower(m.mensaje) LIKE '%chaqueta%' THEN 'Chaquetas'
          WHEN lower(m.mensaje) LIKE '%pantalon%' THEN 'Pantalones'
          WHEN lower(m.mensaje) LIKE '%guante%' THEN 'Guantes'
          WHEN lower(m.mensaje) LIKE '%talla%' THEN 'Tallas'
          WHEN lower(m.mensaje) LIKE '%envio%' OR lower(m.mensaje) LIKE '%envío%' THEN 'Envios'
          WHEN lower(m.mensaje) LIKE '%pago%' OR lower(m.mensaje) LIKE '%nequi%' THEN 'Pagos'
          WHEN lower(m.mensaje) LIKE '%garant%' THEN 'Garantia'
          WHEN lower(m.mensaje) LIKE '%precio%' OR lower(m.mensaje) LIKE '%cuanto%' THEN 'Precios'
          ELSE 'Otros'
        END as topic,
        COUNT(*) as count
      FROM messages m
      WHERE m.is_bot = false
        AND m.fecha_creacion > NOW() - INTERVAL '${interval}'
        AND length(m.mensaje) > 10
      GROUP BY topic
      ORDER BY count DESC
    `);

    return NextResponse.json({
      unknownQuestions: unknownQuestions.rows,
      corrections: corrections.rows,
      topTopics: topTopics.rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
