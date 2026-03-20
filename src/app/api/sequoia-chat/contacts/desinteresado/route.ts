import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, desinteresado } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    if (desinteresado) {
      // Mark as desinteresado + resuelto
      await pool.query(
        `UPDATE contacts SET cliente_desinteresado = true, conversation_status = 2 WHERE session_id = $1`,
        [sessionId]
      );
    } else {
      // Reactivate
      await pool.query(
        `UPDATE contacts SET cliente_desinteresado = false, conversation_status = 0, keepalive_count = 0, last_keepalive_at = NULL WHERE session_id = $1`,
        [sessionId]
      );
    }

    return NextResponse.json({ ok: true, desinteresado });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
