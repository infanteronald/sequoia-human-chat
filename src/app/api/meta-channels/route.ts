import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || "";
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || "";
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || "";

// GET - Webhook verification (same pattern as WhatsApp)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST - Receive messages from Instagram/Facebook Messenger
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const APP_SECRET = process.env.WHATSAPP_APP_SECRET || process.env.FB_APP_SECRET;
    if (APP_SECRET) {
      const signature = req.headers.get("x-hub-signature-256");
      const expectedSig = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
      if (signature !== expectedSig) {
        console.warn("[Meta Channels] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }
    const body = JSON.parse(rawBody);
    const entry = body?.entry?.[0];
    if (!entry) return NextResponse.json({ status: "ok" });

    // Facebook Messenger
    if (entry.messaging) {
      for (const event of entry.messaging) {
        const senderId = event.sender?.id;
        const message = event.message?.text;
        if (!senderId || !message) continue;

        const channel = entry.id === process.env.IG_PAGE_ID ? "instagram" : "facebook";

        // Upsert contact
        await pool.query(
          `INSERT INTO contacts (session_id, nombre, telefono, fecha_ultimo_mensaje, conversation_status, ai_auto)
           VALUES ($1, $2, $3, NOW(), 0, true)
           ON CONFLICT (session_id) DO UPDATE SET fecha_ultimo_mensaje = NOW()`,
          [`${channel}_${senderId}`, `${channel} user`, senderId]
        );

        // Save message
        await pool.query(
          `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status)
           VALUES ($1, $2, $3, false, NOW(), 3)
           ON CONFLICT DO NOTHING`,
          [`${channel}_${Date.now()}`, `${channel}_${senderId}`, message]
        );

        // Auto-respond using AI (reuse the same ai-suggest logic)
        try {
          const aiRes = await fetch(`http://localhost:3001/api/whatsapp/ai-suggest`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
            },
            body: JSON.stringify({ sessionId: `${channel}_${senderId}` }),
          });
          const text = await aiRes.text();
          const match = text.match(/"text":"([^"]+)"/);
          const reply = match ? match[1] : null;

          if (reply && reply !== "__NO_SE__") {
            const token = channel === "instagram" ? IG_ACCESS_TOKEN : PAGE_ACCESS_TOKEN;
            if (token) {
              await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipient: { id: senderId },
                  message: { text: reply },
                  access_token: token,
                }),
              });

              await pool.query(
                `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
                 VALUES ($1, $2, $3, true, NOW(), 2, 'Sequoia Speed AI')`,
                [`${channel}_ai_${Date.now()}`, `${channel}_${senderId}`, reply]
              );
            }
          }
        } catch (e) { console.error(`[${channel}]`, e); }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("[Meta Channels]", e);
    return NextResponse.json({ status: "error" });
  }
}
