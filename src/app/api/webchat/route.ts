import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, visitorName } = await req.json();
    if (!message || !sessionId) return NextResponse.json({ error: "message and sessionId required" }, { status: 400 });

    // Load last 10 messages for context
    const history = await pool.query(
      "SELECT mensaje, is_bot FROM messages WHERE session_id = $1 ORDER BY fecha_creacion DESC LIMIT 10",
      [`web_${sessionId}`]
    );

    // Load knowledge base
    let kbContext = "";
    try {
      const kb = await pool.query("SELECT title, content FROM knowledge_base WHERE enabled = true LIMIT 10");
      if (kb.rows.length > 0) kbContext = "\n\nBASE DE CONOCIMIENTO:\n" + kb.rows.map((r: any) => `[${r.title}]: ${r.content}`).join("\n\n");
    } catch {}

    // Load custom rules
    let rulesContext = "";
    try {
      const rules = await pool.query("SELECT value FROM settings WHERE key = 'ai_rules'");
      if (rules.rows.length > 0) {
        const rulesList = rules.rows[0].value as any[];
        const active = rulesList.filter((r: any) => r.enabled);
        if (active.length > 0) rulesContext = "\n\nREGLAS:\n" + active.map((r: any) => `- ${r.title}: ${r.content}`).join("\n");
      }
    } catch {}

    const messages = history.rows.reverse().map((m: any) => ({
      role: m.is_bot ? "assistant" as const : "user" as const,
      content: m.mensaje,
    }));
    messages.push({ role: "user" as const, content: message });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 150,
      system: `Eres un asistente de ventas de Sequoia Speed, fabricante colombiano de equipos de proteccion para motociclistas. Responde en espanol colombiano, corto y directo. Maximo 2-3 oraciones.${kbContext}${rulesContext}`,
      messages,
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "";

    // Save both messages
    await pool.query(
      "INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status) VALUES ($1, $2, $3, false, NOW(), 3)",
      [`webchat_${Date.now()}_in`, `web_${sessionId}`, message]
    );
    await pool.query(
      "INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente) VALUES ($1, $2, $3, true, NOW(), 2, 'Sequoia Speed AI')",
      [`webchat_${Date.now()}_out`, `web_${sessionId}`, reply]
    );

    // Upsert web contact
    await pool.query(
      `INSERT INTO contacts (session_id, nombre, telefono, fecha_ultimo_mensaje, conversation_status, ai_auto)
       VALUES ($1, $2, 'webchat', NOW(), 0, true)
       ON CONFLICT (session_id) DO UPDATE SET fecha_ultimo_mensaje = NOW()`,
      [`web_${sessionId}`, visitorName || "Visitante Web"]
    );

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("[WebChat]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
