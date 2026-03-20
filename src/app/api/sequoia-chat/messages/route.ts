import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// GET /api/sequoia-chat/messages?sessionId=xxx&page=1&limit=200
// page=1 returns the LAST 200 messages (most recent), page=2 the previous 200, etc.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId = searchParams.get("sessionId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "200");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const [countResult, contactResult] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM messages WHERE session_id = $1", [sessionId]),
      pool.query("SELECT * FROM contacts WHERE session_id = $1", [sessionId]),
      // Mark contact as read when agent opens the chat
      pool.query("UPDATE contacts SET has_unread = false WHERE session_id = $1 AND has_unread = true", [sessionId]),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // page=1 means the LAST page (most recent messages)
    // We reverse the page number so page 1 = newest, page 2 = older, etc.
    const actualPage = Math.max(1, totalPages - page + 1);
    const offset = (actualPage - 1) * limit;

    const messagesResult = await pool.query(
      `SELECT * FROM messages WHERE session_id = $1 ORDER BY fecha_creacion ASC LIMIT $2 OFFSET $3`,
      [sessionId, limit, offset]
    );

    return NextResponse.json({
      messages: messagesResult.rows,
      contact: contactResult.rows[0] || null,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
