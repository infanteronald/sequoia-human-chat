import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const status = searchParams.get("status"); // 0,1,2,3 or null for all
  const agentId = searchParams.get("agentId");
  const labelId = searchParams.get("labelId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const starred = searchParams.get("starred");
  const offset = (page - 1) * limit;

  try {
    let conditions: string[] = [];
    let params: (string | number)[] = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`(c.nombre ILIKE $${paramIdx} OR c.session_id ILIKE $${paramIdx} OR c.telefono ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (status !== null && status !== undefined && status !== "") {
      conditions.push(`c.conversation_status = $${paramIdx}`);
      params.push(parseInt(status));
      paramIdx++;
    }

    if (agentId) {
      if (agentId === "unassigned") {
        conditions.push("c.assigned_agent_id IS NULL");
      } else {
        conditions.push(`c.assigned_agent_id = $${paramIdx}`);
        params.push(parseInt(agentId));
        paramIdx++;
      }
    }

    if (labelId) {
      conditions.push(`EXISTS (SELECT 1 FROM contact_labels cl WHERE cl.contact_id = c.id AND cl.label_id = $${paramIdx})`);
      params.push(parseInt(labelId));
      paramIdx++;
    }

    if (dateFrom) {
      conditions.push(`c.fecha_ultimo_mensaje >= $${paramIdx}`);
      params.push(dateFrom);
      paramIdx++;
    }

    if (dateTo) {
      conditions.push(`c.fecha_ultimo_mensaje <= $${paramIdx}`);
      params.push(dateTo + "T23:59:59");
      paramIdx++;
    }

    if (starred === "true") {
      conditions.push("c.starred = true");
    }

    const filterConditions = conditions.length > 0 ? conditions.join(" AND ") : "";
    const whereClause = filterConditions ? `WHERE ((${filterConditions}) OR c.has_unread = true)` : "";

    const query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM messages m WHERE m.session_id = c.session_id) as total_messages,
        (SELECT mensaje FROM messages m WHERE m.session_id = c.session_id ORDER BY m.fecha_creacion DESC LIMIT 1) as ultimo_mensaje,
        (SELECT is_bot FROM messages m WHERE m.session_id = c.session_id ORDER BY m.fecha_creacion DESC LIMIT 1) as ultimo_es_bot,
        (SELECT m.fecha_creacion FROM messages m WHERE m.session_id = c.session_id AND m.is_bot = false ORDER BY m.fecha_creacion DESC LIMIT 1) as ultimo_mensaje_cliente,
        a.name as agent_name
      FROM contacts c
      LEFT JOIN agents a ON a.id = c.assigned_agent_id
      ${whereClause}
      ORDER BY c.has_unread DESC, c.fecha_ultimo_mensaje DESC NULLS LAST
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;
    params.push(limit, offset);

    const countQuery = `SELECT COUNT(*) FROM contacts c ${whereClause}`;

    const [contactsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, paramIdx - 1)),
    ]);

    // Count by status
    const statusCounts = await pool.query(
      `SELECT conversation_status, COUNT(*) as count FROM contacts GROUP BY conversation_status`
    );
    const counts: Record<string, number> = { all: 0, open: 0, pending: 0, resolved: 0, snoozed: 0 };
    statusCounts.rows.forEach((r: any) => {
      counts.all += parseInt(r.count);
      if (r.conversation_status === 0) counts.open = parseInt(r.count);
      else if (r.conversation_status === 1) counts.pending = parseInt(r.count);
      else if (r.conversation_status === 2) counts.resolved = parseInt(r.count);
      else if (r.conversation_status === 3) counts.snoozed = parseInt(r.count);
    });

    return NextResponse.json({
      contacts: contactsResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      statusCounts: counts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, nombre, telefono, email, ciudad, pais } = body;
    const result = await pool.query(
      `INSERT INTO contacts (session_id, nombre, telefono, email, ciudad, pais, fecha_ultimo_mensaje)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (session_id) DO UPDATE SET
         nombre = COALESCE($2, contacts.nombre),
         telefono = COALESCE($3, contacts.telefono),
         email = COALESCE($4, contacts.email),
         ciudad = COALESCE($5, contacts.ciudad),
         pais = COALESCE($6, contacts.pais)
       RETURNING *`,
      [session_id, nombre, telefono, email, ciudad, pais]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, conversation_status, assigned_agent_id, snoozed_until, starred } = body;

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (conversation_status !== undefined) {
      updates.push(`conversation_status = $${idx}`);
      params.push(conversation_status);
      idx++;
      if (conversation_status === 2) {
        updates.push(`resolved_at = NOW()`);
      }
    }

    if (assigned_agent_id !== undefined) {
      updates.push(`assigned_agent_id = $${idx}`);
      params.push(assigned_agent_id === null ? null : assigned_agent_id);
      idx++;
    }

    if (snoozed_until !== undefined) {
      updates.push(`snoozed_until = $${idx}`);
      params.push(snoozed_until);
      idx++;
    }

    if (starred !== undefined) {
      updates.push(`starred = $${idx}`);
      params.push(starred);
      idx++;
    }

    if (updates.length === 0) return NextResponse.json({ error: "No updates" }, { status: 400 });

    params.push(contactId);
    const result = await pool.query(
      `UPDATE contacts SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
