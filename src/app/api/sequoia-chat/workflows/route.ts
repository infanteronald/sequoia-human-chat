import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM workflows ORDER BY created_at DESC");
    return NextResponse.json({ workflows: result.rows.map(r => ({ ...r, trigger: r.trigger_event, steps: r.steps })) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, trigger, steps, enabled } = await req.json();
    const result = await pool.query(
      "INSERT INTO workflows (name, trigger_event, steps, enabled) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, trigger, JSON.stringify(steps), enabled !== false]
    );
    return NextResponse.json(result.rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, trigger, steps, enabled } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); params.push(name); }
    if (trigger !== undefined) { fields.push(`trigger_event = $${idx++}`); params.push(trigger); }
    if (steps !== undefined) { fields.push(`steps = $${idx++}`); params.push(JSON.stringify(steps)); }
    if (enabled !== undefined) { fields.push(`enabled = $${idx++}`); params.push(enabled); }
    fields.push("updated_at = NOW()");
    params.push(id);
    
    await pool.query(`UPDATE workflows SET ${fields.join(", ")} WHERE id = $${idx}`, params);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await pool.query("DELETE FROM workflows WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
