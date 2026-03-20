import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

// GET - List knowledge base entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get("source_type");
    const enabled = searchParams.get("enabled");

    let query = "SELECT * FROM knowledge_base";
    const conditions: string[] = [];
    const params: any[] = [];

    if (sourceType) {
      params.push(sourceType);
      conditions.push(`source_type = \$${params.length}`);
    }
    if (enabled !== null && enabled !== undefined && enabled !== "") {
      params.push(enabled === "true");
      conditions.push(`enabled = \$${params.length}`);
    }

    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("[KB GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create manual article
export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "title y content son requeridos" }, { status: 400 });
    }

    const tokensEstimate = Math.ceil(content.length / 4);

    const result = await pool.query(
      `INSERT INTO knowledge_base (title, content, source_type, category, tokens_estimate)
       VALUES (\$1, \$2, 'manual', \$3, \$4) RETURNING *`,
      [title, content, category || "General", tokensEstimate]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("[KB POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update entry
export async function PATCH(req: NextRequest) {
  try {
    const { id, title, content, category, enabled } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    const fields: string[] = [];
    const params: any[] = [];

    if (title !== undefined) { params.push(title); fields.push(`title = \$${params.length}`); }
    if (content !== undefined) {
      params.push(content);
      fields.push(`content = \$${params.length}`);
      const tokens = Math.ceil(content.length / 4);
      params.push(tokens);
      fields.push(`tokens_estimate = \$${params.length}`);
    }
    if (category !== undefined) { params.push(category); fields.push(`category = \$${params.length}`); }
    if (enabled !== undefined) { params.push(enabled); fields.push(`enabled = \$${params.length}`); }

    fields.push("updated_at = NOW()");

    params.push(id);
    const result = await pool.query(
      `UPDATE knowledge_base SET ${fields.join(", ")} WHERE id = \$${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("[KB PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove entry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    await pool.query("DELETE FROM knowledge_base WHERE id = \$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[KB DELETE]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
