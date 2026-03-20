import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Send CSAT survey via WhatsApp interactive buttons
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    // Send interactive button message
    const waRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: sessionId,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Nos gustaria saber como fue su experiencia con nuestro servicio. Como calificaria la atencion recibida?"
          },
          action: {
            buttons: [
              { type: "reply", reply: { id: "csat_5", title: "⭐⭐⭐⭐⭐" } },
              { type: "reply", reply: { id: "csat_3", title: "⭐⭐⭐" } },
              { type: "reply", reply: { id: "csat_1", title: "⭐" } },
            ]
          }
        }
      }),
    });

    const waData = await waRes.json();
    if (waData.error) {
      return NextResponse.json({ error: waData.error.message }, { status: 500 });
    }

    // Save sent survey to messages
    await pool.query(
      `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
       VALUES ($1, $2, $3, true, NOW(), 2, 'Sistema')`,
      [`csat_survey_${Date.now()}`, sessionId, "Encuesta de satisfaccion enviada"]
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
