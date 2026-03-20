import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sequoiaspeed.com.co";

export async function POST(req: NextRequest) {
  try {
    const { guiaUrl, sessionId } = await req.json();
    if (!guiaUrl || !sessionId) {
      return NextResponse.json({ error: "guiaUrl and sessionId required" }, { status: 400 });
    }

    const fullUrl = guiaUrl.startsWith("http") ? guiaUrl : `${BASE_URL}${guiaUrl}`;

    // Send image with caption via WhatsApp
    const waRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: sessionId,
        type: "image",
        image: {
          link: fullUrl,
          caption: "Aqui le comparto su guia de envio. Quedo atento si tiene alguna duda.",
        },
      }),
    });

    const waData = await waRes.json();
    if (waData.error) {
      return NextResponse.json({ error: waData.error.message }, { status: 500 });
    }

    const messageId = waData.messages?.[0]?.id || "guia_" + Date.now();

    // Save to messages table so it appears in chat
    await pool.query(
      `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente, tipo_archivo, ruta_archivo)
       VALUES ($1, $2, $3, true, NOW(), 2, 'Sequoia Speed', 'image', $4)`,
      [messageId, sessionId, "Aqui le comparto su guia de envio. Quedo atento si tiene alguna duda.", guiaUrl]
    );

    return NextResponse.json({ success: true, messageId });
  } catch (e: any) {
    console.error("[Guias Send]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
