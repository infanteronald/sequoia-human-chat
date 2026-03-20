import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "30");
    if (q.length < 2) return NextResponse.json([]);

    const result = await pool.query(
      `SELECT m.id, m.session_id, m.mensaje, m.is_bot, m.fecha_creacion, m.nombre_agente,
              c.nombre as contact_name
       FROM messages m
       LEFT JOIN contacts c ON c.session_id = m.session_id
       WHERE to_tsvector('spanish', COALESCE(m.mensaje, '')) @@ plainto_tsquery('spanish', $1)
          OR m.mensaje ILIKE $2
       ORDER BY m.fecha_creacion DESC
       LIMIT $3`,
      [q, `%${q}%`, limit]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
