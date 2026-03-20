import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// Get contacts who showed interest but didn't buy (abandoned interest)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    // Find contacts who:
    // 1. Had AI conversations about products in the last N days
    // 2. Haven't been contacted in 48+ hours
    // 3. Are not marked as desinteresado
    // 4. Conversation is not resolved
    const result = await pool.query(`
      SELECT DISTINCT c.session_id, c.nombre, c.ciudad,
        (SELECT m.mensaje FROM messages m WHERE m.session_id = c.session_id AND m.is_bot = false 
         AND m.mensaje ILIKE ANY(ARRAY['%chaqueta%','%impermeable%','%pantalon%','%guante%','%precio%','%talla%','%comprar%'])
         ORDER BY m.fecha_creacion DESC LIMIT 1) as last_product_interest,
        c.fecha_ultimo_mensaje,
        EXTRACT(EPOCH FROM (NOW() - c.fecha_ultimo_mensaje))/3600 as hours_since_last
      FROM contacts c
      WHERE c.conversation_status != 2
        AND c.cliente_desinteresado = false
        AND c.fecha_ultimo_mensaje > NOW() - INTERVAL '${days} days'
        AND c.fecha_ultimo_mensaje < NOW() - INTERVAL '48 hours'
        AND EXISTS (
          SELECT 1 FROM messages m WHERE m.session_id = c.session_id 
          AND m.is_bot = false
          AND m.mensaje ILIKE ANY(ARRAY['%chaqueta%','%impermeable%','%pantalon%','%guante%','%precio%','%talla%','%comprar%'])
          AND m.fecha_creacion > NOW() - INTERVAL '${days} days'
        )
      ORDER BY c.fecha_ultimo_mensaje DESC
      LIMIT 50
    `);

    return NextResponse.json({ 
      abandonedInterests: result.rows,
      total: result.rows.length 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
