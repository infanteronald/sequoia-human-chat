import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function POST(req: NextRequest) {
  try {
    const { type, data, secret } = await req.json();
    if (secret !== "sequoia_import_2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (type === "contacts") {
      let inserted = 0;
      for (const c of data) {
        await pool.query(
          `INSERT INTO contacts (session_id, nombre, telefono, fecha_ultimo_mensaje)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id) DO UPDATE SET
             nombre = COALESCE(EXCLUDED.nombre, contacts.nombre),
             fecha_ultimo_mensaje = GREATEST(contacts.fecha_ultimo_mensaje, EXCLUDED.fecha_ultimo_mensaje)`,
          [
            c.sessionId || c.session_id,
            c.nombre || c.nombreContacto || null,
            c.telefono || c.sessionId || c.session_id,
            c.fechaUltimoMensaje || c.fecha_ultimo_mensaje || new Date().toISOString()
          ]
        );
        inserted++;
      }
      return NextResponse.json({ ok: true, inserted });
    }

    if (type === "messages") {
      const sessionId = data.sessionId;
      const messages = data.messages;
      let inserted = 0;
      for (const m of messages) {
        try {
          await pool.query(
            `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, nombre_agente, tipo_archivo, ruta_archivo, fecha_creacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (mensaje_id) DO NOTHING`,
            [
              m.mensajeId || m.mensaje_id || (sessionId + "_" + inserted),
              sessionId,
              m.mensaje || "",
              m.isBot || false,
              m.nombreAgente || null,
              m.tipoArchivo || null,
              m.rutaArchivo || null,
              m.fechaCreacion || m.fecha_creacion || new Date().toISOString()
            ]
          );
          inserted++;
        } catch (e) {
          // skip duplicates
        }
      }
      return NextResponse.json({ ok: true, inserted, sessionId });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("[Import Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
