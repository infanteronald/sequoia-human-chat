import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// POST /api/sequoia-chat/note { sessionId, note }
export async function POST(req: NextRequest) {
  try {
    const { sessionId, note } = await req.json();
    if (!sessionId || !note) {
      return NextResponse.json({ error: "sessionId and note required" }, { status: 400 });
    }
    const result = await pool.query(
      `INSERT INTO messages (session_id, mensaje, is_bot, nombre_agente, private, fecha_creacion)
       VALUES ($1, $2, true, 'Nota Interna', true, NOW()) RETURNING *`,
      [sessionId, note]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
