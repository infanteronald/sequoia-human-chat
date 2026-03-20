const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const AI_SUGGEST_URL = process.env.AI_SUGGEST_URL || "http://localhost:3001/api/whatsapp/ai-suggest";

// Follow-up messages by level
const FOLLOWUP_MESSAGES = [
  // Level 1: 2 hours - simple check-in
  (nombre, trato) => `${trato === "señora" ? "Doña" : "Don"} ${nombre}, se encuentra en línea?`,
  // Level 2: 24 hours - remind product + value
  (nombre, trato, producto) => producto
    ? `${trato === "señora" ? "Doña" : "Don"} ${nombre}, quedó pendiente de ${producto}. Tiene alguna duda que le pueda resolver?`
    : `${trato === "señora" ? "Doña" : "Don"} ${nombre}, quedamos pendientes de su pedido. Tiene alguna duda que le pueda resolver?`,
  // Level 3: 48 hours - urgency + FOMO
  (nombre, trato, producto) => producto
    ? `${trato === "señora" ? "Doña" : "Don"} ${nombre}, le separamos ${producto} que estaba mirando. Si necesita algo me avisa`
    : `${trato === "señora" ? "Doña" : "Don"} ${nombre}, le tenemos separado su pedido. Si necesita algo me avisa`,
];

// Follow-up delays in hours
const FOLLOWUP_DELAYS = [2, 24, 48];

// Gender detection (simplified - matches the main app logic)
const FEMALE_NAMES = new Set(["maria","ana","laura","andrea","camila","valentina","daniela","carolina","diana","paola","paula","natalia","alejandra","juliana","marcela","sandra","monica","lina","angela","claudia","martha","gloria","luz","rosa","adriana","tatiana","viviana","lorena","patricia","fernanda","isabel","catalina","vanessa","jessica","karen","luisa","milena","yesenia","samantha","johana","yuliana","stephanie","sofia","isabella","mariana","gabriela","ximena","sara","lucia","jimena","silvia","liliana","pilar","carmen","rocio","consuelo","amparo","esperanza","olga","nelly","eliana","leidy","mayra","yolanda","beatriz","teresa","mireya","ingrid","fabiola","fatima","florencia","giselle","gladys","helena","hilda","irene","iris","irma","ivonne","jazmin","jennifer","jenny","josefina","juana","julieta","karina","karla","kelly","kiara","kimberly","larisa","leticia","lilia","liliana","lina","linda","lorena","lourdes","lucia","luciana","luisa","luna","lupita","magdalena","manuela","mara","margarita","marisol","marlene","marta","martha","martina","matilde","mercedes","micaela","michelle","milagros","mildred","milena","minerva","miranda","mireya","miriam","monica","nadia","nancy","naomi","natalia","nathalia","nayeli","nicole","nidia","nora","norma","nuria","olga","olivia","oriana","paloma","pamela","paola","patricia","paulina","paula","perla","pilar","priscila","rafaela","raquel","rebeca","regina","renata","rita","rocio","romina","rosa","rosario","roxana","ruby","ruth","sabrina","salome","samantha","sandra","sara","sarah","selena","silvia","simona","sofia","soledad","sonia","sophia","soraya","stefania","stephanie","susana","tamara","tania","tatiana","teresa","valentina","valeria","vanessa","veronica","victoria","violeta","virginia","viviana","wendy","ximena","xiomara","yesenia","yolanda","yuliana","zulma"]);

function detectGender(name) {
  if (!name) return "señor";
  const first = name.trim().split(/\s+/)[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (FEMALE_NAMES.has(first)) return "señora";
  if (first.endsWith("a") && !["joshua","garcia","borja","sasha"].includes(first)) return "señora";
  return "señor";
}

async function sendWhatsApp(to, text) {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
    console.log("[FollowUp] WhatsApp not configured, skipping send to", to);
    return false;
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.error("[FollowUp] WhatsApp error:", data.error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[FollowUp] Send failed:", e.message);
    return false;
  }
}

async function detectProduct(sessionId) {
  // Look at last few messages to detect what product client was interested in
  try {
    const result = await pool.query(
      `SELECT mensaje FROM messages WHERE session_id = $1 AND is_bot = true
       ORDER BY fecha_creacion DESC LIMIT 10`,
      [sessionId]
    );
    const allText = result.rows.map(r => r.mensaje).join(" ").toLowerCase();

    // Common product keywords
    const products = [
      { keywords: ["chaqueta black pro", "black pro"], name: "la Chaqueta Black Pro" },
      { keywords: ["chaqueta sahara", "sahara"], name: "la Chaqueta Sahara" },
      { keywords: ["chaqueta hydra", "hydra"], name: "la Chaqueta Hydra" },
      { keywords: ["firefly", "reflectiva firefly", "chaqueta reflectiva"], name: "la Chaqueta Firefly" },
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
        return p.name;
      }
    }
  } catch (e) {
    console.error("[FollowUp] Product detection error:", e.message);
  }
  return null;
}

function isWithinBusinessHours() {
  const now = new Date();
  // Convert to Colombia time (GMT-5)
  const colombiaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const hour = colombiaTime.getHours();
  const day = colombiaTime.getDay(); // 0=Sunday, 6=Saturday

  // Sunday: no follow-ups
  if (day === 0) return false;

  // Saturday: only until 4pm
  if (day === 6 && hour >= 16) return false;

  // All days: 8am to 8pm
  if (hour < 8 || hour >= 20) return false;

  return true;
}

async function processFollowUps() {
  if (!isWithinBusinessHours()) {
    console.log("[FollowUp] Outside business hours, skipping");
    return;
  }

  try {
    // Find contacts that need follow-up:
    // 1. Last message is from bot (client hasn't replied)
    // 2. followup_count < 3 (haven't exhausted follow-ups)
    // 3. followup_next_at <= NOW (time to send)
    // 4. Not blocked, not resolved, not desinteresado
    const result = await pool.query(`
      SELECT c.session_id, c.nombre, c.followup_count, c.followup_product
      FROM contacts c
      WHERE c.blocked = false
        AND c.cliente_desinteresado = false
        AND c.conversation_status != 2
        AND c.followup_count < 3
        AND c.followup_next_at IS NOT NULL
        AND c.followup_next_at <= NOW()
        AND c.ultimo_es_bot = true
    `);

    console.log(`[FollowUp] Found ${result.rows.length} contacts to follow up`);

    for (const contact of result.rows) {
      const { session_id, nombre, followup_count, followup_product } = contact;
      const displayName = nombre || "cliente";
      const trato = detectGender(displayName);
      const firstName = displayName.split(/\s+/)[0];

      // Detect product if not already stored
      let product = followup_product;
      if (!product && followup_count === 0) {
        product = await detectProduct(session_id);
        if (product) {
          await pool.query("UPDATE contacts SET followup_product = $1 WHERE session_id = $2", [product, session_id]);
        }
      }

      // Get the message for this follow-up level
      const msgFn = FOLLOWUP_MESSAGES[followup_count];
      if (!msgFn) continue;

      const message = msgFn(firstName, trato, product);

      console.log(`[FollowUp] Sending level ${followup_count + 1} to ${session_id} (${firstName}): "${message}"`);

      // Send WhatsApp message
      const sent = await sendWhatsApp(session_id, message);
      if (!sent) {
        console.error(`[FollowUp] Failed to send to ${session_id}`);
        continue;
      }

      // Save message to DB
      const msgId = `followup_${Date.now()}_${followup_count}`;
      await pool.query(
        `INSERT INTO messages (mensaje_id, session_id, mensaje, is_bot, fecha_creacion, status, nombre_agente)
         VALUES ($1, $2, $3, true, NOW(), 1, 'Sequoia Speed AI')`,
        [msgId, session_id, message]
      );

      // Update follow-up state
      const nextCount = followup_count + 1;
      const nextDelay = FOLLOWUP_DELAYS[nextCount] || null;

      await pool.query(`
        UPDATE contacts SET
          followup_count = $1,
          followup_next_at = $2,
          ultimo_es_bot = true
        WHERE session_id = $3
      `, [
        nextCount,
        nextDelay ? new Date(Date.now() + nextDelay * 60 * 60 * 1000) : null,
        session_id
      ]);

      console.log(`[FollowUp] Done. Level ${nextCount}/3 for ${firstName}. Next: ${nextDelay ? `${nextDelay}h` : "none"}`);

      // Small delay between messages to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e) {
    console.error("[FollowUp] Error:", e.message);
  }
}

// Also: schedule follow-ups for contacts where last message is bot and no followup_next_at set
async function scheduleNewFollowUps() {
  try {
    // Find contacts where:
    // - ultimo_es_bot = true (we sent last message)
    // - followup_next_at IS NULL (no follow-up scheduled yet)
    // - followup_count < 3
    // - Last bot message was > 2 hours ago
    // - Not blocked/resolved/desinteresado
    const result = await pool.query(`
      SELECT c.session_id, c.nombre
      FROM contacts c
      WHERE c.blocked = false
        AND c.cliente_desinteresado = false
        AND c.conversation_status != 2
        AND c.followup_count < 3
        AND c.followup_next_at IS NULL
        AND c.ultimo_es_bot = true
        AND c.fecha_ultimo_mensaje < NOW() - INTERVAL '2 hours'
    `);

    for (const contact of result.rows) {
      const delay = FOLLOWUP_DELAYS[contact.followup_count || 0] || 2;
      // Schedule based on last message time + delay
      await pool.query(`
        UPDATE contacts SET followup_next_at = fecha_ultimo_mensaje + INTERVAL '${delay} hours'
        WHERE session_id = $1
      `, [contact.session_id]);

      console.log(`[FollowUp] Scheduled follow-up for ${contact.nombre || contact.session_id}`);
    }
  } catch (e) {
    console.error("[FollowUp] Schedule error:", e.message);
  }
}

// Check if ultimo_es_bot column exists, if not we need to track it
async function ensureColumns() {
  try {
    await pool.query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ultimo_es_bot BOOLEAN DEFAULT false`);

    // Update ultimo_es_bot for all existing contacts based on last message
    await pool.query(`
      UPDATE contacts c SET ultimo_es_bot = sub.is_bot
      FROM (
        SELECT DISTINCT ON (session_id) session_id, is_bot
        FROM messages
        ORDER BY session_id, fecha_creacion DESC
      ) sub
      WHERE c.session_id = sub.session_id
    `);
    console.log("[FollowUp] Columns verified and ultimo_es_bot synced");
  } catch (e) {
    console.error("[FollowUp] Column setup error:", e.message);
  }
}

// Main loop
async function main() {
  console.log("[FollowUp] Starting follow-up cron service...");
  console.log("[FollowUp] Schedule: Every 5 minutes, 8am-8pm L-V, 8am-4pm Sab, Domingos OFF");

  await ensureColumns();

  // Run every 5 minutes
  setInterval(async () => {
    await scheduleNewFollowUps();
    await processFollowUps();
  }, 5 * 60 * 1000);

  // Also run immediately
  await scheduleNewFollowUps();
  await processFollowUps();
}

main().catch(console.error);
