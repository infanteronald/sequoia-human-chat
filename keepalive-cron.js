// Keepalive cron - calls /api/whatsapp/keepalive every 5 minutes
// Sends "Como vas?" to chats that are 12+ hours old to prevent 24h window expiration

const URL = "http://localhost:3001/api/whatsapp/keepalive";

async function run() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    const ts = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
    console.log(`[${ts}] Keepalive: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Keepalive error:`, err.message);
  }
}

// Run immediately on start
run();

// Then every 5 minutes
setInterval(run, 5 * 60 * 1000);
