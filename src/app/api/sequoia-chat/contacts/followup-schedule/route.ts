import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, followupNextAt } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    if (followupNextAt) {
      await pool.query(
        "UPDATE contacts SET followup_next_at = $1 WHERE session_id = $2",
        [followupNextAt, sessionId]
      );
    } else {
      await pool.query(
        "UPDATE contacts SET followup_next_at = NULL WHERE session_id = $1",
        [sessionId]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
