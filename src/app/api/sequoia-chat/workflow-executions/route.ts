import { NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM workflow_executions ORDER BY updated_at DESC LIMIT 50"
    );
    return NextResponse.json({ executions: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
