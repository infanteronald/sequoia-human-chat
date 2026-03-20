import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function PATCH(req: NextRequest) {
  try {
    const { mode } = await req.json();
    if (!mode || !["full_ai", "hybrid", "human"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    // Save mode globally in settings
    await pool.query(
      "INSERT INTO settings (key, value) VALUES (\'ai_mode\', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = $1::jsonb",
      [JSON.stringify(mode)]
    );

    if (mode === "full_ai") {
      const result = await pool.query("UPDATE contacts SET ai_auto = true WHERE blocked = false");
      return NextResponse.json({ success: true, mode, updated: result.rowCount });
    } else {
      const result = await pool.query("UPDATE contacts SET ai_auto = false");
      return NextResponse.json({ success: true, mode, updated: result.rowCount });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = \'ai_mode\'");
    const mode = result.rows[0]?.value || "hybrid";
    return NextResponse.json({ mode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
