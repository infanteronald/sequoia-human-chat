import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, aiAuto } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    await pool.query("UPDATE contacts SET ai_auto = $1 WHERE session_id = $2", [!!aiAuto, sessionId]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
