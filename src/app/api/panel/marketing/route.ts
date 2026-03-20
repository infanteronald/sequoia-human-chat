import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD || "SqPost2026xKv9mR",
  database: "sequoiaspeed",
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await pool.connect();
  try {
    const { rows: campaigns } = await client.query(
      `SELECT * FROM marketing_campaigns ORDER BY created_at DESC LIMIT 100`
    );

    const { rows: statsRows } = await client.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(sent_count), 0) as total_sent,
        CASE WHEN SUM(sent_count) > 0 
          THEN ROUND(SUM(open_count)::numeric / NULLIF(SUM(sent_count), 0) * 100, 1) 
          ELSE 0 END as open_rate,
        CASE WHEN SUM(sent_count) > 0 
          THEN ROUND(SUM(click_count)::numeric / NULLIF(SUM(sent_count), 0) * 100, 1) 
          ELSE 0 END as click_rate
      FROM marketing_campaigns
    `);

    const stats = statsRows[0] || { total: 0, total_sent: 0, open_rate: 0, click_rate: 0 };

    return NextResponse.json({
      campaigns: campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        subject: c.subject,
        content: c.content,
        segmentId: c.segment_id,
        status: c.status,
        sentCount: c.sent_count,
        openCount: c.open_count,
        clickCount: c.click_count,
        scheduledAt: c.scheduled_at,
        sentAt: c.sent_at,
        createdAt: c.created_at,
      })),
      stats: {
        total: Number(stats.total),
        totalSent: Number(stats.total_sent),
        openRate: Number(stats.open_rate),
        clickRate: Number(stats.click_rate),
      },
    });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  const client = await pool.connect();
  try {
    if (action === "create") {
      const { name, type, subject, content, segmentId, scheduledAt } = body;
      if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

      const { rows } = await client.query(
        `INSERT INTO marketing_campaigns (name, type, subject, content, segment_id, status, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, type || "email", subject || "", content || "", segmentId || null, scheduledAt ? "scheduled" : "draft", scheduledAt || null]
      );
      return NextResponse.json({ campaign: rows[0] });
    }

    if (action === "update-status") {
      const { id, status } = body;
      await client.query(`UPDATE marketing_campaigns SET status = $1 WHERE id = $2`, [status, id]);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { id } = body;
      await client.query(`DELETE FROM marketing_campaigns WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } finally {
    client.release();
  }
}
