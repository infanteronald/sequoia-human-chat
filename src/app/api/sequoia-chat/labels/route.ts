import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// GET /api/sequoia-chat/labels
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM labels ORDER BY title");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sequoia-chat/labels { action: "add"|"remove", contactId, labelId }
export async function POST(req: NextRequest) {
  try {
    const { action, contactId, labelId } = await req.json();
    if (action === "add") {
      await pool.query(
        "INSERT INTO contact_labels (contact_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [contactId, labelId]
      );
    } else if (action === "remove") {
      await pool.query(
        "DELETE FROM contact_labels WHERE contact_id = $1 AND label_id = $2",
        [contactId, labelId]
      );
    }
    // Return updated labels for this contact
    const result = await pool.query(
      `SELECT l.* FROM labels l
       JOIN contact_labels cl ON cl.label_id = l.id
       WHERE cl.contact_id = $1
       ORDER BY l.title`,
      [contactId]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
