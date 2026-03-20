import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";
import { analyzeSentiment } from "@/lib/sentiment";
import { triggerWorkflows, resumeWaitingExecutions } from "@/lib/workflow-engine";

// Auto-AI debounce map: sessionId -> timeout
const pendingAutoAI: Map<string, NodeJS.Timeout> = new Map();
const AUTO_AI_DEBOUNCE = 15000; // 15 seconds debounce - realistic human reading/thinking time
const LINE_DELAY = 10000; // 10 seconds between multi-line messages - simulates typing each paragraph

// Helper: Process auto AI response
async function processAutoAI(sessionId: string) {
  try {
    // Skip if last client message is a sticker/media-only (not text)
    const lastMsg = await pool.query(
      "SELECT mensaje, tipo_archivo FROM messages WHERE session_id = $1 AND is_bot = false ORDER BY fecha_creacion DESC LIMIT 1",
      [sessionId]
    );
    if (lastMsg.rows.length > 0) {
      const lt = lastMsg.rows[0].tipo_archivo;
      const lm = lastMsg.rows[0].mensaje || "";
      if (lt === "sticker" || lt === "audio" || lt === "video" || lm === "[Sticker]" || lm.startsWith("[Reaccion:")) {
        console.log("[Auto-AI] Skipping - last message is media/sticker for", sessionId);
        return;
      }
    }
    // Check if bot already responded after last client message (prevent double responses)
    const lastBotCheck = await pool.query(
      `SELECT 1 FROM messages WHERE session_id = $1 AND is_bot = true 
       AND fecha_creacion > (SELECT MAX(fecha_creacion) FROM messages WHERE session_id = $1 AND is_bot = false)
       LIMIT 1`,
      [sessionId]
    );
    if (lastBotCheck.rows.length > 0) {
      console.log("[Auto-AI] Skipping - bot already responded for", sessionId);
      return;
    }
    console.log("[Auto-AI] Processing for", sessionId);
    
    const res = await fetch("http://localhost:3001/api/whatsapp/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!res.ok) {
      console.error("[Auto-AI] ai-suggest failed:", res.status);
      return;
    }

    // Parse SSE stream to extract suggestion
    const fullText = await res.text();
    const sseLines = fullText.split("\n");
    let suggestion = "";
    let eventType = "";
    
    for (const line of sseLines) {
      if (line.startsWith("event: ")) eventType = line.slice(7);
      else if (line.startsWith("data: ") && eventType === "suggestion") {
        try {
          const payload = JSON.parse(line.slice(6));
          suggestion = payload.text || "";
        } catch {}
      }
    }

    if (!suggestion || suggestion.trim() === "") {
      console.log("[Auto-AI] No suggestion for", sessionId);
      return;
    }

    // If AI doesn't know, send "Permitame consultar" instead of silence
    if (suggestion === "__NO_SE__") {
      console.log("[Auto-AI] Unknown question for", sessionId, "- sending consult message");
      const consultMsg = "Permítame consultar un momento";
      await sendWhatsApp(sessionId, consultMsg);
      const msgId = "auto_ai_consult_" + Date.now();
      await pool.query(
        `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
         VALUES ($1, $2, $3, true, NOW(), 1, 'Sequoia Speed AI')`,
        [msgId, sessionId, consultMsg]
      );
      return;
    }

    // Send as ONE single message (like a real human would)
    const finalMsg = suggestion.replace(/\n\n/g, "\n").trim();
    
    // Dynamic delay: simulates reading + thinking + typing (~50ms/char, min 8s, max 25s)
    const typingDelay = Math.min(Math.max(finalMsg.length * 50, 8000), 25000);
    await new Promise(resolve => setTimeout(resolve, typingDelay));
    
    // Send via WhatsApp
    await sendWhatsApp(sessionId, finalMsg);
    
    // Save to DB
    const msgId = "auto_ai_" + Date.now();
    await pool.query(
      `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
       VALUES ($1, $2, $3, true, NOW(), 1, 'Sequoia Speed AI')`,
      [msgId, sessionId, finalMsg]
    );
    
    console.log("[Auto-AI] Sent 1 message to", sessionId);
  } catch (error) {
    console.error("[Auto-AI] Error:", error);
  }
}

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "sequoia_whatsapp_verify_2026";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// GET - Webhook verification
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

// Helper: Check if within business hours
async function isWithinBusinessHours(): Promise<{ within: boolean; message: string }> {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'business_hours'");
    if (!result.rows[0]) return { within: true, message: "" };
    const config = result.rows[0].value;
    if (!config.enabled) return { within: true, message: "" };

    const now = new Date();
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayKey = days[now.getDay()];
    const schedule = config.schedule?.[dayKey];

    if (!schedule) return { within: false, message: config.auto_message || "" };

    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { within: true, message: "" };
    }
    return { within: false, message: config.auto_message || "" };
  } catch { return { within: true, message: "" }; }
}

// Helper: Check welcome message for new contacts
async function checkWelcomeMessage(sessionId: string): Promise<string | null> {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'welcome_message'");
    if (!result.rows[0]) return null;
    const config = result.rows[0].value;
    if (!config.enabled) return null;

    const msgCheck = await pool.query(
      "SELECT COUNT(*) FROM messages WHERE session_id = $1 AND is_bot = true",
      [sessionId]
    );
    if (parseInt(msgCheck.rows[0].count) > 0) return null;

    return config.message || null;
  } catch { return null; }
}

// Helper: Run automation rules
async function runAutomations(event: string, sessionId: string, message: string, contactId: number) {
  try {
    const rules = await pool.query(
      "SELECT * FROM automation_rules WHERE event = $1 AND is_active = true",
      [event]
    );

    for (const rule of rules.rows) {
      let match = true;
      const conditions = rule.conditions || [];

      for (const cond of conditions) {
        if (cond.type === "contains" && cond.value) {
          if (!message.toLowerCase().includes(cond.value.toLowerCase())) match = false;
        }
        if (cond.type === "starts_with" && cond.value) {
          if (!message.toLowerCase().startsWith(cond.value.toLowerCase())) match = false;
        }
      }

      if (!match) continue;

      const actions = rule.actions || [];
      for (const action of actions) {
        if (action.type === "add_label" && action.labelId) {
          await pool.query(
            "INSERT INTO contact_labels (contact_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [contactId, action.labelId]
          );
        }
        if (action.type === "set_status" && action.status !== undefined) {
          await pool.query("UPDATE contacts SET conversation_status = $1 WHERE id = $2", [action.status, contactId]);
        }
        if (action.type === "assign_agent" && action.agentId) {
          await pool.query("UPDATE contacts SET assigned_agent_id = $1 WHERE id = $2", [action.agentId, contactId]);
        }
      }

      await pool.query("UPDATE automation_rules SET execution_count = execution_count + 1 WHERE id = $1", [rule.id]);
    }
  } catch (e) { console.error("[Automation Error]", e); }
}

// Helper: Send WhatsApp message
// Show "typing..." indicator to the client
async function showTyping(to: string) {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === "PENDIENTE_CONFIGURAR") return;
  try {
    await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { body: "" }, status: "typing" }),
    });
  } catch {}
}

async function sendWhatsApp(to: string, text: string) {
  if (!ACCESS_TOKEN || ACCESS_TOKEN === "PENDIENTE_CONFIGURAR") return;
  try {
    // Show typing indicator before sending
    await showTyping(to);
    await new Promise(r => setTimeout(r, 2000)); // Brief pause after typing starts
    
    await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
    });
  } catch {}
}

// POST - Receive incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    if (!value) return NextResponse.json({ status: "ok" });

    // Process incoming messages
    if (value.messages) {
      for (const msg of value.messages) {
        const from = msg.from;
        const timestamp = msg.timestamp;
        const messageId = msg.id;
        const contactInfo = value.contacts?.find((c: any) => c.wa_id === from);
        const contactName = contactInfo?.profile?.name || null;

        // Check global AI mode for new contacts
        const aiModeResult = await pool.query("SELECT value FROM settings WHERE key = 'ai_mode'");
        const globalAiMode = aiModeResult.rows[0]?.value || "hybrid";
        const newContactAiAuto = globalAiMode === "full_ai";

        // Upsert contact - reopen if resolved, set ai_auto based on global mode for NEW contacts
        const contactResult = await pool.query(
          `INSERT INTO contacts (session_id, nombre, telefono, fecha_ultimo_mensaje, conversation_status, ai_auto)
           VALUES ($1, $2, $1, NOW(), 0, $3)
           ON CONFLICT (session_id) DO UPDATE SET
             nombre = COALESCE($2, contacts.nombre),
             fecha_ultimo_mensaje = NOW(),
             keepalive_count = 0,
             last_keepalive_at = NULL,
             cliente_desinteresado = false,
             has_unread = true,
             followup_count = 0,
             followup_next_at = NULL,
             followup_product = NULL,
             ultimo_es_bot = false,
             conversation_status = CASE WHEN contacts.conversation_status = 2 THEN 0 ELSE contacts.conversation_status END
           RETURNING *`,
          [from, contactName, newContactAiAuto]
        );
        const contact = contactResult.rows[0];

        // Skip blocked contacts - don't process their messages
        if (contact?.blocked) {
          console.log("[Webhook] Blocked contact, ignoring:", from);
          continue;
        }

        // Extract message content
        let messageText = "";
        let fileUrl = null;
        let fileType = null;

        switch (msg.type) {
          case "text": messageText = msg.text?.body || ""; break;
          case "image": messageText = msg.image?.caption || "[Imagen]"; fileType = "image"; fileUrl = msg.image?.id; break;
          case "audio": messageText = "[Audio]"; fileType = "audio"; fileUrl = msg.audio?.id; break;
          case "video": messageText = msg.video?.caption || "[Video]"; fileType = "video"; fileUrl = msg.video?.id; break;
          case "document": messageText = msg.document?.caption || `[Doc: ${msg.document?.filename || ""}]`; fileType = "document"; fileUrl = msg.document?.id; break;
          case "location": messageText = `[Ubicacion: ${msg.location?.latitude}, ${msg.location?.longitude}]`; break;
          case "sticker": messageText = "[Sticker]"; fileType = "sticker"; fileUrl = msg.sticker?.id; break;
          case "reaction": messageText = `[Reaccion: ${msg.reaction?.emoji}]`; break;
          case "contacts": messageText = "[Contacto compartido]"; break;
          case "interactive": {
            // Button or list reply from client
            const btnReply = msg.interactive?.button_reply;
            const listReply = msg.interactive?.list_reply;
            if (btnReply) {
              const btnId = btnReply.id || "";
              
              // CSAT response handling
              if (btnId.startsWith("csat_")) {
                const rating = parseInt(btnId.replace("csat_", ""));
                if ([1, 3, 5].includes(rating)) {
                  try {
                    const contactRes = await pool.query("SELECT id FROM contacts WHERE session_id = $1", [from]);
                    if (contactRes.rows.length > 0) {
                      await pool.query(
                        "INSERT INTO csat_responses (contact_id, conversation_session, rating, created_at) VALUES ($1, $2, $3, NOW())",
                        [contactRes.rows[0].id, from, rating]
                      );
                    }
                  } catch (e) { console.error("[CSAT]", e); }
                  messageText = rating >= 4 ? "Gracias por su calificacion positiva!" : rating >= 3 ? "Gracias por su respuesta" : "Gracias por su respuesta, tomaremos nota";
                  // Don't trigger AI for CSAT responses
                  await pool.query(
                    `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status)
                     VALUES ($1, $2, $3, false, NOW(), 3)`,
                    [messageId, from, `[CSAT: ${rating}/5 estrellas]`]
                  );
                  // Send thank you
                  await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ messaging_product: "whatsapp", to: from, type: "text", text: { body: rating >= 4 ? "Muchas gracias por su calificacion! Nos alegra que haya tenido una buena experiencia." : "Gracias por tomarse el tiempo de responder. Trabajaremos para mejorar nuestro servicio." } }),
                  });
                  continue; // Skip normal message processing
                }
              }

              // Map button IDs to natural language for AI
              if (btnId.startsWith("tallas_")) messageText = "Que tallas tienen disponibles?";
              else if (btnId.startsWith("fotos_")) messageText = "Me pueden mostrar fotos del producto?";
              else if (btnId.startsWith("comprar_")) messageText = "Quiero comprar este producto";
              else if (btnId.startsWith("cat_")) {
                const catMap: Record<string, string> = { impermeables: "impermeables", chaquetas: "chaquetas", pantalones: "pantalones", guantes: "guantes", combos: "combos" };
                const cat = btnId.replace("cat_", "");
                messageText = `Me interesan los ${catMap[cat] || cat}`;
              } else {
                messageText = btnReply.title || "[Boton]";
              }
            } else if (listReply) {
              messageText = listReply.title || "[Lista]";
            } else {
              messageText = "[Interactivo]";
            }
            break;
          }
          default: messageText = `[${msg.type || "Desconocido"}]`;
        }

        // Transcribe audio messages using local Whisper
        if (msg.type === "audio" && msg.audio?.id) {
          try {
            // 1. Get media URL from WhatsApp
            const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${msg.audio.id}`, {
              headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            });
            const mediaData = await mediaRes.json();

            if (mediaData.url) {
              // 2. Download audio binary
              const audioRes = await fetch(mediaData.url, {
                headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
              });
              const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

              // 3. Send to local Whisper service
              const whisperRes = await fetch("http://127.0.0.1:5555", {
                method: "POST",
                headers: { "Content-Type": "application/octet-stream", "Content-Length": String(audioBuffer.length) },
                body: audioBuffer,
              });
              const whisperData = await whisperRes.json();

              if (whisperData.ok && whisperData.text) {
                messageText = `[Audio transcrito] ${whisperData.text}`;
                console.log(`[Whisper] ${from}: ${whisperData.text.substring(0, 100)}`);
              }
            }
          } catch (e: any) {
            console.error("[Whisper] Transcription failed:", e.message);
            // Keep "[Audio]" as fallback
          }
        }

        // Save message
        await pool.query(
          `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, tipo_archivo, ruta_archivo, fecha_creacion, wa_message_id, status, metadata)
           VALUES ($1, $2, $3, false, $4, $5, to_timestamp($6), $1, 3, $7)
           ON CONFLICT (mensaje_id) DO NOTHING`,
          [messageId, from, messageText, fileType, fileUrl, parseInt(timestamp),
           JSON.stringify({ type: msg.type, raw: msg })]
        );

        // Run automations
        if (contact) {
          await runAutomations("message_received", from, messageText, contact.id);
        }

        // Workflow engine: resume waiting workflows + trigger new ones
        if (contact && messageText.trim()) {
          await resumeWaitingExecutions(from, messageText);
          await triggerWorkflows("message_received", from, messageText, contact);
          const msgCount = await pool.query("SELECT COUNT(*) FROM messages WHERE session_id = $1", [from]);
          if (parseInt(msgCount.rows[0].count) <= 1) {
            await triggerWorkflows("new_contact", from, messageText, contact);
          }
        }

        // Auto-AI: if contact has ai_auto enabled and message is text
        // Sentiment check - auto-escalate to human if frustrated
        if (messageText.trim() && contact) {
          const sentiment = analyzeSentiment(messageText);
          if (sentiment.shouldEscalate && sentiment.reason) {
            // Disable AI auto for this contact and add internal note
            await pool.query("UPDATE contacts SET ai_auto = false WHERE session_id = $1", [from]);
            await pool.query(
              `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nota_interna, private)
               VALUES ($1, $2, $3, true, NOW(), 3, true, true)`,
              [`sentiment_${Date.now()}`, from, `⚠️ Handoff automatico: ${sentiment.reason} (score: ${sentiment.score}/100). IA desactivada para este cliente.`]
            );
            console.log(`[Sentiment] Auto-handoff for ${from}: ${sentiment.reason} (score: ${sentiment.score})`);
          }
        }

        if (contact && contact.ai_auto && (msg.type === "text" || msg.type === "interactive") && messageText.trim()) {
          const existing = pendingAutoAI.get(from);
          if (existing) clearTimeout(existing);
          
          const timer = setTimeout(() => {
            pendingAutoAI.delete(from);
            processAutoAI(from);
          }, AUTO_AI_DEBOUNCE);
          pendingAutoAI.set(from, timer);
        }

        // Welcome message for new contacts
        const welcomeMsg = await checkWelcomeMessage(from);
        if (welcomeMsg && contact) {
          const personalizedMsg = welcomeMsg.replace(/\{nombre\}/g, contact.nombre || "");
          await sendWhatsApp(from, personalizedMsg);
        }

        // Business hours check
        const { within, message: autoMsg } = await isWithinBusinessHours();
        if (!within && autoMsg && contact) {
          const personalizedMsg = autoMsg.replace(/\{nombre\}/g, contact.nombre || "");
          await sendWhatsApp(from, personalizedMsg);
        }

        console.log(`[WA] ${from}: ${messageText.substring(0, 50)}`);
      }
    }

    // Process status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        const statusMap: Record<string, number> = { sent: 1, delivered: 2, read: 3, failed: 4 };
        const statusCode = statusMap[status.status] || 0;
        const errorMsg = status.errors?.[0]?.message || null;

        await pool.query(
          `UPDATE messages SET status = $1, error_message = $2,
           metadata = COALESCE(metadata, '{}'::jsonb) || $3
           WHERE wa_message_id = $4 OR mensaje_id = $4`,
          [statusCode, errorMsg,
           JSON.stringify({ [`${status.status}_at`]: status.timestamp }),
           status.id]
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[WA Webhook Error]", error);
    return NextResponse.json({ status: "error", message: error.message });
  }
}
