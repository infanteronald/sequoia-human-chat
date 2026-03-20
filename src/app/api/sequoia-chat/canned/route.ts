import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// GET /api/sequoia-chat/canned?search=xxx
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  try {
    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM canned_responses
         WHERE short_code ILIKE $1 OR content ILIKE $1
         ORDER BY CASE
           WHEN short_code ILIKE $2 THEN 1
           WHEN short_code ILIKE $1 THEN 2
           ELSE 3
         END`,
        [`%${search}%`, `${search}%`]
      );
    } else {
      result = await pool.query("SELECT * FROM canned_responses ORDER BY short_code");
    }
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sequoia-chat/canned { short_code, content, media }
export async function POST(req: NextRequest) {
  try {
    const { short_code, content, media } = await req.json();
    if (!short_code || !content) {
      return NextResponse.json({ error: "short_code and content required" }, { status: 400 });
    }
    const result = await pool.query(
      "INSERT INTO canned_responses (short_code, content, media) VALUES ($1, $2, $3) RETURNING *",
      [short_code.toLowerCase().replace(/[^a-z0-9_]/g, ""), content, JSON.stringify(media || [])]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/sequoia-chat/canned { id, content, media }
export async function PUT(req: NextRequest) {
  try {
    const { id, short_code, content, media } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (short_code !== undefined) {
      updates.push(`short_code = $${idx}`);
      params.push(short_code.toLowerCase().replace(/[^a-z0-9_]/g, ""));
      idx++;
    }
    if (content !== undefined) {
      updates.push(`content = $${idx}`);
      params.push(content);
      idx++;
    }
    if (media !== undefined) {
      updates.push(`media = $${idx}`);
      params.push(JSON.stringify(media));
      idx++;
    }

    if (updates.length === 0) return NextResponse.json({ error: "No updates" }, { status: 400 });

    params.push(id);
    const result = await pool.query(
      `UPDATE canned_responses SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sequoia-chat/canned?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    await pool.query("DELETE FROM canned_responses WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
