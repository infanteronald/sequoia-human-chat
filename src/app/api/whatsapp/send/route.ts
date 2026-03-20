import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://sequoiaspeed.com.co";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, template, templateParams, templateComponents, templateLang, mediaUrl, mediaType, mediaName, source } = body;

    if (!to) return NextResponse.json({ error: "Destinatario requerido" }, { status: 400 });
    if (!ACCESS_TOKEN || ACCESS_TOKEN === "PENDIENTE_CONFIGURAR") {
      return NextResponse.json({ error: "Token de WhatsApp no configurado. Configura WHATSAPP_ACCESS_TOKEN en .env" }, { status: 400 });
    }

    let waBody: any;
    let savedMessage = "";
    let fileType: string | null = null;
    let fileUrl: string | null = null;

    if (template) {
      // Send template message
      const components: any[] = templateComponents || [];
      if (!templateComponents && templateParams && templateParams.length > 0) {
        components.push({
          type: "body",
          parameters: templateParams.map((p: string) => ({ type: "text", text: p })),
        });
      }
      waBody = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: templateLang || "es" },
          ...(components.length > 0 ? { components } : {}),
        },
      };
      savedMessage = `[Template: ${template}]`;
    } else if (mediaUrl && mediaType) {
      // Send media message (image, video, document)
      const fullUrl = mediaUrl.startsWith("http") ? mediaUrl : `${BASE_URL}${mediaUrl}`;
      fileType = mediaType;
      fileUrl = mediaUrl;

      if (mediaType === "image") {
        waBody = {
          messaging_product: "whatsapp",
          to,
          type: "image",
          image: { link: fullUrl },
        };
        savedMessage = message || "";
      } else if (mediaType === "video") {
        waBody = {
          messaging_product: "whatsapp",
          to,
          type: "video",
          video: { link: fullUrl },
        };
        savedMessage = message || "";
      } else if (mediaType === "audio") {
        waBody = {
          messaging_product: "whatsapp",
          to,
          type: "audio",
          audio: { link: fullUrl },
        };
        savedMessage = message || "";
      } else if (mediaType === "document") {
        waBody = {
          messaging_product: "whatsapp",
          to,
          type: "document",
          document: { link: fullUrl, filename: mediaName || fullUrl.split("/").pop() || "documento" },
        };
        savedMessage = message || "";
      } else {
        return NextResponse.json({ error: "mediaType must be image, video, audio, or document" }, { status: 400 });
      }
    } else if (body.interactive) {
      // Interactive message (buttons or list)
      waBody = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: body.interactive,
      };
      savedMessage = body.interactive?.body?.text || message || "";
    } else {
      // Send text message
      if (!message) return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
      waBody = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      };
      savedMessage = message;
    }

    // Send via WhatsApp Cloud API
    const waRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(waBody),
    });

    const waData = await waRes.json();

    if (!waRes.ok) {
      const errorMsg = waData?.error?.message || "Error al enviar";
      await pool.query(
        `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, tipo_archivo, ruta_archivo, fecha_creacion, status, error_message)
         VALUES ($1, $2, $3, true, $4, $5, NOW(), 4, $6)`,
        [`fail_${Date.now()}`, to, savedMessage, fileType, fileUrl, errorMsg]
      );
      return NextResponse.json({ error: errorMsg, details: waData }, { status: 400 });
    }

    const waMessageId = waData.messages?.[0]?.id || `local_${Date.now()}`;

    // Determine agent name based on source
    const agentName = source === "ai" ? "Sequoia Speed AI" : "Sequoia Speed";

    // Save sent message to DB with file info
    await pool.query(
      `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, tipo_archivo, ruta_archivo, fecha_creacion, status, wa_message_id, nombre_agente)
       VALUES ($1, $2, $3, true, $4, $5, NOW(), 1, $1, $6)`,
      [waMessageId, to, savedMessage, fileType, fileUrl, agentName]
    );

    // Update contact's last message time
    await pool.query(
      "UPDATE contacts SET fecha_ultimo_mensaje = NOW(), ultimo_es_bot = true WHERE session_id = $1",
      [to]
    );

    return NextResponse.json({ success: true, messageId: waMessageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
