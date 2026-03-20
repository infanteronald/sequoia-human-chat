import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (key) {
      const result = await pool.query("SELECT value FROM settings WHERE key = $1", [key]);
      return NextResponse.json(result.rows[0]?.value || null);
    }
    const result = await pool.query("SELECT * FROM settings ORDER BY key");
    const settings: Record<string, any> = {};
    result.rows.forEach((r: any) => { settings[r.key] = r.value; });
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();
    await pool.query(
      "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
      [key, JSON.stringify(value)]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
