import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function sendWhatsApp(to: string, message: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    // Check Colombia time (UTC-5) - only send between 6AM and 8PM
    const now = new Date();
    const colombiaHour = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" })).getHours();

    if (colombiaHour < 8 || colombiaHour >= 20) {
      return NextResponse.json({ status: "outside_hours", colombiaHour, sent: 0 });
    }

    // Find contacts needing keepalive
    const result = await pool.query(`
      SELECT c.session_id, c.keepalive_count, c.nombre, c.followup_product
      FROM contacts c
      WHERE c.cliente_desinteresado = false
        AND c.keepalive_count < 2
        AND c.conversation_status != 2
        AND EXISTS (
          SELECT 1 FROM messages m
          WHERE m.session_id = c.session_id
            AND m.is_bot = false
            AND m.fecha_creacion > NOW() - INTERVAL '24 hours'
            AND m.fecha_creacion < NOW() - INTERVAL '12 hours'
            AND m.fecha_creacion = (
              SELECT MAX(m2.fecha_creacion) FROM messages m2
              WHERE m2.session_id = c.session_id AND m2.is_bot = false
            )
        )
        AND (c.last_keepalive_at IS NULL OR c.last_keepalive_at < NOW() - INTERVAL '11 hours')
    `);

    const sent: string[] = [];
    const autoDisinterested: string[] = [];

    for (const contact of result.rows) {
      try {
        // Detect product from last messages if not stored
        let product = contact.followup_product || "";
        if (!product) {
          const prodResult = await pool.query(
            `SELECT mensaje FROM messages WHERE session_id = $1 AND is_bot = true ORDER BY fecha_creacion DESC LIMIT 10`,
            [contact.session_id]
          );
          const allText = prodResult.rows.map((r: any) => r.mensaje).join(" ").toLowerCase();
          const products = [
            { keywords: ["chaqueta black pro", "black pro"], name: "la Chaqueta Black Pro" },
            { keywords: ["chaqueta sahara", "sahara"], name: "la Chaqueta Sahara" },
            { keywords: ["chaqueta hydra", "hydra"], name: "la Chaqueta Hydra" },
            { keywords: ["firefly", "reflectiva firefly"], name: "la Chaqueta Firefly" },
            { keywords: ["chaqueta mesh", "mesh"], name: "la Chaqueta Mesh" },
            { keywords: ["impermeable storm", "storm"], name: "el Impermeable Storm" },
            { keywords: ["pantalon black", "pantalón black"], name: "el Pantalón Black Pro" },
            { keywords: ["pantalon gas", "pantalón gas"], name: "el Pantalón Gas" },
            { keywords: ["guantes"], name: "los Guantes" },
            { keywords: ["traje", "combo"], name: "el Traje" },
            { keywords: ["maleta", "morral"], name: "la Maleta" },
            { keywords: ["chaleco"], name: "el Chaleco" },
            { keywords: ["botas"], name: "las Botas" },
          ];
          for (const p of products) {
            if (p.keywords.some(k => allText.includes(k))) {
              product = p.name;
              break;
            }
          }
        }

        // Build personalized keepalive message based on count and product
        let keepaliveMsg: string;
        const nombre = (contact.nombre || "").split(/\s+/)[0];
        if (contact.keepalive_count === 0) {
          // First keepalive - mention product if available
          keepaliveMsg = product
            ? `Hola, quedó interesado en ${product}? Quedo atento`
            : "Como vas? Quedo atento por si tiene alguna duda";
        } else {
          // Second keepalive - last chance
          keepaliveMsg = product
            ? `Le tenemos ${product} disponible. Si necesita algo me avisa`
            : "Quedo pendiente de usted, cualquier duda me avisa";
        }

        // Send keepalive
        await sendWhatsApp(contact.session_id, keepaliveMsg);

        // Save message in DB
        const msgId = `keepalive_${contact.session_id}_${Date.now()}`;
        await pool.query(
          `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, nombre_agente, status)
           VALUES ($1, $2, $3, true, NOW(), 'Sistema', 1)`,
          [msgId, contact.session_id, keepaliveMsg]
        );

        const newCount = contact.keepalive_count + 1;

        if (newCount >= 2) {
          // Auto-mark as desinteresado + resuelto
          await pool.query(
            `UPDATE contacts
             SET keepalive_count = $1, last_keepalive_at = NOW(),
                 cliente_desinteresado = true, conversation_status = 2
             WHERE session_id = $2`,
            [newCount, contact.session_id]
          );
          autoDisinterested.push(contact.session_id);
        } else {
          await pool.query(
            `UPDATE contacts SET keepalive_count = $1, last_keepalive_at = NOW()
             WHERE session_id = $2`,
            [newCount, contact.session_id]
          );
        }

        // Update fecha_ultimo_mensaje
        await pool.query(
          "UPDATE contacts SET fecha_ultimo_mensaje = NOW() WHERE session_id = $1",
          [contact.session_id]
        );

        sent.push(contact.session_id);
        console.log(`[Keepalive] Sent to ${contact.session_id} (count: ${newCount})`);
      } catch (err) {
        console.error(`[Keepalive] Error sending to ${contact.session_id}:`, err);
      }
    }

    return NextResponse.json({
      status: "ok",
      colombiaHour,
      candidates: result.rows.length,
      sent: sent.length,
      sentTo: sent,
      autoDisinterested,
    });
  } catch (error: any) {
    console.error("[Keepalive] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
