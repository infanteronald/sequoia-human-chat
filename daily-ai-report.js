const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const https = require("https");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const REPORT_EMAIL = process.env.REPORT_EMAIL;
const FROM_EMAIL = "Sequoia Speed AI <ventas@sequoiaspeed.com.co>";

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

function getColombiaDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
}

function getColombiaHour() {
  return getColombiaDate().getHours();
}

function getTodayDateStr() {
  const d = getColombiaDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate() {
  const d = getColombiaDate();
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function callClaude(prompt, maxTokens = 2000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.content && parsed.content[0]) {
            resolve(parsed.content[0].text);
          } else {
            reject(new Error("No content in response: " + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function getConversations(dateStr) {
  // Get all contacts that had AI messages today
  const result = await pool.query(`
    SELECT DISTINCT c.session_id, c.nombre, c.ciudad, c.blocked
    FROM messages m
    JOIN contacts c ON c.session_id = m.session_id
    WHERE m.fecha_creacion::date = $1
      AND m.is_bot = true
      AND m.nombre_agente = 'Sequoia Speed AI'
    ORDER BY c.nombre
  `, [dateStr]);

  const conversations = [];
  for (const contact of result.rows) {
    const msgs = await pool.query(`
      SELECT mensaje, is_bot, nombre_agente, to_char(fecha_creacion, 'HH24:MI') as hora
      FROM messages
      WHERE session_id = $1 AND fecha_creacion::date = $2
      ORDER BY fecha_creacion
    `, [contact.session_id, dateStr]);

    const aiMsgCount = msgs.rows.filter(m => m.nombre_agente === "Sequoia Speed AI").length;
    const humanMsgCount = msgs.rows.filter(m => m.is_bot && m.nombre_agente !== "Sequoia Speed AI").length;
    const clientMsgCount = msgs.rows.filter(m => !m.is_bot).length;

    conversations.push({
      ...contact,
      messages: msgs.rows,
      aiMsgCount,
      humanMsgCount,
      clientMsgCount,
      totalBotMsgs: aiMsgCount + humanMsgCount,
      pctAI: aiMsgCount + humanMsgCount > 0 ? Math.round((aiMsgCount / (aiMsgCount + humanMsgCount)) * 100) : 0,
    });
  }

  return conversations;
}

async function analyzeConversation(conv) {
  const transcript = conv.messages.map(m => {
    const sender = m.is_bot ? (m.nombre_agente === "Sequoia Speed AI" ? "🤖 IA" : "👤 Humano") : "📱 Cliente";
    return `[${m.hora}] ${sender}: ${m.mensaje || "[media]"}`;
  }).join("\n");

  const prompt = `Eres un auditor de calidad de un chat de ventas de Sequoia Speed (equipos de protección para motociclistas en Colombia).
Analiza esta conversación y responde EN ESPAÑOL con formato conciso:

CONTACTO: ${conv.nombre || "Desconocido"} (${conv.session_id})
Ciudad: ${conv.ciudad || "No especificada"}
Mensajes IA: ${conv.aiMsgCount} | Humano: ${conv.humanMsgCount} | Cliente: ${conv.clientMsgCount}

TRANSCRIPCIÓN:
${transcript}

Responde con este formato exacto (sin markdown, texto plano):
CALIFICACION: [1-10]/10
RESUMEN: [1 línea resumen de la conversación]
ACIERTOS: [lista separada por | de lo que hizo bien la IA]
PROBLEMAS: [lista separada por | de errores o problemas. Si no hay, escribe "Ninguno"]
SEVERIDAD: [BAJA/MEDIA/ALTA/CRITICA]
RECOMENDACION: [1 línea de mejora principal]`;

  try {
    const analysis = await callClaude(prompt, 500);
    return analysis;
  } catch (e) {
    console.error(`[Report] Error analyzing ${conv.nombre}:`, e.message);
    return `CALIFICACION: N/A\nRESUMEN: Error al analizar\nACIERTOS: N/A\nPROBLEMAS: Error de API\nSEVERIDAD: N/A\nRECOMENDACION: Revisar manualmente`;
  }
}

function parseAnalysis(text) {
  const lines = text.split("\n");
  const result = {};
  for (const line of lines) {
    const match = line.match(/^(CALIFICACION|RESUMEN|ACIERTOS|PROBLEMAS|SEVERIDAD|RECOMENDACION):\s*(.+)/i);
    if (match) {
      result[match[1].toUpperCase()] = match[2].trim();
    }
  }
  return result;
}

function severityColor(sev) {
  const s = (sev || "").toUpperCase();
  if (s.includes("CRITICA")) return "#DC2626";
  if (s.includes("ALTA")) return "#EA580C";
  if (s.includes("MEDIA")) return "#D97706";
  return "#16A34A";
}

function severityEmoji(sev) {
  const s = (sev || "").toUpperCase();
  if (s.includes("CRITICA")) return "🔴";
  if (s.includes("ALTA")) return "🟠";
  if (s.includes("MEDIA")) return "🟡";
  return "🟢";
}

function buildEmailHTML(date, conversations, analyses) {
  const totalContacts = conversations.length;
  const totalAIMsgs = conversations.reduce((s, c) => s + c.aiMsgCount, 0);
  const totalHumanMsgs = conversations.reduce((s, c) => s + c.humanMsgCount, 0);
  const totalClientMsgs = conversations.reduce((s, c) => s + c.clientMsgCount, 0);
  const pctAIGlobal = totalAIMsgs + totalHumanMsgs > 0 ? Math.round((totalAIMsgs / (totalAIMsgs + totalHumanMsgs)) * 100) : 0;

  // Collect critical issues
  const criticalIssues = [];
  const recommendations = [];

  for (let i = 0; i < conversations.length; i++) {
    const a = analyses[i];
    if (a.SEVERIDAD && (a.SEVERIDAD.includes("CRITICA") || a.SEVERIDAD.includes("ALTA"))) {
      criticalIssues.push({ nombre: conversations[i].nombre, problema: a.PROBLEMAS, severidad: a.SEVERIDAD });
    }
    if (a.RECOMENDACION && a.RECOMENDACION !== "N/A") {
      recommendations.push(a.RECOMENDACION);
    }
  }

  // Deduplicate recommendations
  const uniqueRecs = [...new Set(recommendations)];

  let contactRows = "";
  for (let i = 0; i < conversations.length; i++) {
    const c = conversations[i];
    const a = analyses[i];
    contactRows += `
      <tr style="border-bottom: 1px solid #374151;">
        <td style="padding: 12px 8px;">
          <strong>${c.nombre || "Desconocido"}</strong><br>
          <span style="color: #9CA3AF; font-size: 12px;">${c.session_id}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center;">
          <span style="color: #A78BFA;">✨ ${c.aiMsgCount}</span> /
          <span style="color: #60A5FA;">👤 ${c.humanMsgCount}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-size: 18px;">${a.CALIFICACION || "N/A"}</td>
        <td style="padding: 12px 8px; text-align: center;">
          <span style="background: ${severityColor(a.SEVERIDAD)}20; color: ${severityColor(a.SEVERIDAD)}; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
            ${severityEmoji(a.SEVERIDAD)} ${a.SEVERIDAD || "N/A"}
          </span>
        </td>
        <td style="padding: 12px 8px; font-size: 12px; color: #D1D5DB;">${a.RESUMEN || ""}</td>
      </tr>
      ${a.PROBLEMAS && a.PROBLEMAS !== "Ninguno" ? `
      <tr style="border-bottom: 2px solid #1F2937;">
        <td colspan="5" style="padding: 4px 8px 12px 24px; font-size: 11px;">
          <span style="color: #F87171;">⚠️ ${a.PROBLEMAS}</span>
        </td>
      </tr>` : ""}`;
  }

  let criticalSection = "";
  if (criticalIssues.length > 0) {
    criticalSection = `
    <div style="background: #7F1D1D20; border: 1px solid #DC2626; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="color: #FCA5A5; margin: 0 0 12px 0;">🚨 HALLAZGOS CRÍTICOS (${criticalIssues.length})</h3>
      ${criticalIssues.map(ci => `
        <p style="color: #FCA5A5; margin: 4px 0; font-size: 13px;">
          <strong>${ci.nombre}:</strong> ${ci.problema}
        </p>`).join("")}
    </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin: 0; padding: 0; background: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E1B4B, #312E81); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">📊 INFORME IA DIARIO</h1>
      <p style="color: #A5B4FC; margin: 8px 0 0 0; font-size: 14px;">Sequoia Speed — ${date}</p>
    </div>

    <!-- Stats Cards -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #60A5FA; font-size: 28px; font-weight: bold;">${totalContacts}</div>
        <div style="color: #94A3B8; font-size: 11px;">CONTACTOS</div>
      </div>
      <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #A78BFA; font-size: 28px; font-weight: bold;">✨ ${totalAIMsgs}</div>
        <div style="color: #94A3B8; font-size: 11px;">MENSAJES IA</div>
      </div>
      <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #34D399; font-size: 28px; font-weight: bold;">👤 ${totalHumanMsgs}</div>
        <div style="color: #94A3B8; font-size: 11px;">MENSAJES HUMANO</div>
      </div>
      <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="color: #FBBF24; font-size: 28px; font-weight: bold;">${pctAIGlobal}%</div>
        <div style="color: #94A3B8; font-size: 11px;">% IA</div>
      </div>
    </div>

    ${criticalSection}

    <!-- Contact Analysis Table -->
    <div style="background: #1E293B; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
      <div style="padding: 16px; border-bottom: 1px solid #374151;">
        <h3 style="color: white; margin: 0;">🔍 ANÁLISIS POR CONTACTO</h3>
      </div>
      <table style="width: 100%; border-collapse: collapse; color: #E5E7EB; font-size: 13px;">
        <thead>
          <tr style="background: #111827;">
            <th style="padding: 10px 8px; text-align: left; color: #9CA3AF; font-size: 11px;">CONTACTO</th>
            <th style="padding: 10px 8px; text-align: center; color: #9CA3AF; font-size: 11px;">IA / HUMANO</th>
            <th style="padding: 10px 8px; text-align: center; color: #9CA3AF; font-size: 11px;">NOTA</th>
            <th style="padding: 10px 8px; text-align: center; color: #9CA3AF; font-size: 11px;">SEVERIDAD</th>
            <th style="padding: 10px 8px; text-align: left; color: #9CA3AF; font-size: 11px;">RESUMEN</th>
          </tr>
        </thead>
        <tbody>
          ${contactRows}
        </tbody>
      </table>
    </div>

    <!-- Recommendations -->
    <div style="background: #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="color: white; margin: 0 0 12px 0;">📋 RECOMENDACIONES</h3>
      ${uniqueRecs.length > 0 ? uniqueRecs.map((r, i) => `
        <p style="color: #D1D5DB; margin: 6px 0; font-size: 13px;">
          ${i + 1}. ${r}
        </p>`).join("") : '<p style="color: #6B7280;">Sin recomendaciones adicionales</p>'}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 16px; color: #6B7280; font-size: 11px;">
      <p>Generado automáticamente por Sequoia Speed AI</p>
      <p>Mensajes del cliente: ${totalClientMsgs} | Total mensajes bot: ${totalAIMsgs + totalHumanMsgs}</p>
    </div>
  </div>
</body>
</html>`;
}

async function generateAndSendReport() {
  const dateStr = getTodayDateStr();
  const dateHuman = formatDate();

  console.log(`[Report] Generating AI report for ${dateStr}...`);

  // Get conversations with AI involvement
  const conversations = await getConversations(dateStr);

  if (conversations.length === 0) {
    console.log("[Report] No AI conversations today, skipping report");
    return;
  }

  console.log(`[Report] Found ${conversations.length} contacts with AI interactions`);

  // Analyze each conversation with Claude
  const analyses = [];
  for (const conv of conversations) {
    console.log(`[Report] Analyzing ${conv.nombre || conv.session_id}...`);
    const rawAnalysis = await analyzeConversation(conv);
    analyses.push(parseAnalysis(rawAnalysis));
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  // Build email HTML
  const html = buildEmailHTML(dateHuman, conversations, analyses);

  // Send email
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: REPORT_EMAIL,
      subject: `📊 Informe IA Diario — ${dateHuman} | ${conversations.length} contactos`,
      html,
    });
    console.log(`[Report] Email sent to ${REPORT_EMAIL}`);
  } catch (e) {
    console.error("[Report] Email send failed:", e.message);
  }
}

// Main: run at 6PM Colombia (18:00) every day
let lastRunDate = null;

async function checkAndRun() {
  const hour = getColombiaHour();
  const today = getTodayDateStr();

  // Run at 6PM if we haven't run today
  if (hour === 18 && lastRunDate !== today) {
    lastRunDate = today;
    try {
      await generateAndSendReport();
    } catch (e) {
      console.error("[Report] Error:", e.message);
    }
  }
}

async function main() {
  console.log("[Report] Daily AI Report service started");
  console.log(`[Report] Schedule: Every day at 6:00 PM Colombia time`);
  console.log(`[Report] Email: ${REPORT_EMAIL}`);

  // Check if we should run now (in case of restart after 6PM)
  // Only run immediately if called with --now flag
  if (process.argv.includes("--now")) {
    console.log("[Report] Running immediately (--now flag)");
    await generateAndSendReport();
    if (process.argv.includes("--once")) {
      console.log("[Report] Done (--once flag)");
      process.exit(0);
    }
  }

  // Check every minute
  setInterval(checkAndRun, 60 * 1000);
  checkAndRun();
}

main().catch(console.error);
