import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  user: "postgres",
  password: "SqPost2026xKv9mR",
  database: "sequoiaspeed",
  max: 5,
});

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM gift_cards ORDER BY created_at DESC"
    );
    const cards = rows.map((r: any) => ({
      ...r,
      initial_value: Number(r.initial_value),
      balance: Number(r.balance),
    }));
    // Stats
    const total = cards.length;
    const activeValue = cards
      .filter((c: any) => c.status === "active")
      .reduce((s: number, c: any) => s + c.balance, 0);
    const redeemedAmount = cards.reduce(
      (s: number, c: any) => s + (c.initial_value - c.balance),
      0
    );
    return NextResponse.json({ cards, stats: { total, activeValue, redeemedAmount } });
  } catch (error) {
    console.error("Gift cards GET error:", error);
    return NextResponse.json({ cards: [], stats: { total: 0, activeValue: 0, redeemedAmount: 0 } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "disable") {
      const { id } = body;
      await pool.query("UPDATE gift_cards SET status = 'disabled' WHERE id = $1", [id]);
      return NextResponse.json({ ok: true });
    }

    // Create new gift card
    const { code, initial_value, customer_email, customer_name, note, expires_at } = body;
    if (!code || !initial_value) {
      return NextResponse.json({ error: "Código y valor son requeridos" }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO gift_cards (code, initial_value, balance, currency, status, customer_email, customer_name, note, expires_at)
       VALUES ($1, $2, $2, 'COP', 'active', $3, $4, $5, $6)
       RETURNING *`,
      [code.toUpperCase(), initial_value, customer_email || null, customer_name || null, note || null, expires_at || null]
    );
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe una tarjeta con ese código" }, { status: 400 });
    }
    console.error("Gift cards POST error:", error);
    return NextResponse.json({ error: "Error procesando tarjeta de regalo" }, { status: 500 });
  }
}
