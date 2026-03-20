import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, blocked } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    await pool.query(
      "UPDATE contacts SET blocked = $1 WHERE session_id = $2",
      [!!blocked, sessionId]
    );

    return NextResponse.json({ ok: true, blocked: !!blocked });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
