import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM agents ORDER BY name");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json();
    const result = await pool.query(
      "INSERT INTO agents (name, email, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name=$1, role=$3 RETURNING *",
      [name, email, role || "agent"]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, email, role } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx}`); params.push(name); idx++; }
    if (email !== undefined) { updates.push(`email = $${idx}`); params.push(email); idx++; }
    if (role !== undefined) { updates.push(`role = $${idx}`); params.push(role); idx++; }

    if (updates.length === 0) return NextResponse.json({ error: "No updates" }, { status: 400 });

    params.push(id);
    const result = await pool.query(
      `UPDATE agents SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
