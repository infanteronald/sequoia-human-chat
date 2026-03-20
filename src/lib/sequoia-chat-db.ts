import pg from "pg";

if (!process.env.SEQUOIA_CHAT_DB_URL) {
  console.warn("[DB] SEQUOIA_CHAT_DB_URL not set — database connections will fail");
}

const pool = new pg.Pool({
  connectionString: process.env.SEQUOIA_CHAT_DB_URL,
  max: 10,
});

export default pool;
