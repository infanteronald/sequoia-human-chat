import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "sequoia-chat",
  user: "postgres",
  password: process.env.DB_PASSWORD,
});

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, connected, config, created_at, updated_at FROM integrations ORDER BY created_at"
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, config, connected } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { rows } = await pool.query(
      `UPDATE integrations
       SET config = COALESCE($2, config),
           connected = COALESCE($3, connected),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, config ? JSON.stringify(config) : null, connected ?? null]
    );

    if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await pool.query(
      "UPDATE integrations SET connected = false, config = '{}', updated_at = NOW() WHERE id = $1",
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
