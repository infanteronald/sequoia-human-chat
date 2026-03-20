import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM automation_rules ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, description, event, conditions, actions, is_active } = await req.json();
    
    if (id) {
      // Update
      const result = await pool.query(
        `UPDATE automation_rules SET name=$1, description=$2, event=$3, conditions=$4, actions=$5, is_active=$6 WHERE id=$7 RETURNING *`,
        [name, description, event, JSON.stringify(conditions), JSON.stringify(actions), is_active, id]
      );
      return NextResponse.json(result.rows[0]);
    }
    
    // Create
    const result = await pool.query(
      `INSERT INTO automation_rules (name, description, event, conditions, actions, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, event, JSON.stringify(conditions), JSON.stringify(actions), is_active ?? true]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    await pool.query("DELETE FROM automation_rules WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
