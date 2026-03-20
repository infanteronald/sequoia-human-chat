import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // Preview: count matching customers for given rules
  if (action === "preview") {
    const rulesParam = searchParams.get("rules");
    if (!rulesParam) return NextResponse.json({ count: 0 });
    try {
      const rules = JSON.parse(rulesParam);
      const { where, params } = buildWhereFromRules(rules);
      const countQuery = `SELECT COUNT(DISTINCT u.id) as count FROM users u LEFT JOIN (SELECT "userId", COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_spent, MAX("createdAt") as last_order_date FROM orders GROUP BY "userId") o ON u.id = o."userId" ${where ? "WHERE " + where : ""}`;
      const result: { count: bigint }[] = await prisma.$queryRawUnsafe(countQuery, ...params);
      return NextResponse.json({ count: Number(result[0]?.count || 0) });
    } catch {
      return NextResponse.json({ count: 0 });
    }
  }

  // List customers for a segment
  if (action === "customers") {
    const segmentId = searchParams.get("segmentId");
    const preset = searchParams.get("preset");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    let where = "";
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (preset) {
      const presetWhere = getPresetWhere(preset);
      where = presetWhere.where;
      params.push(...presetWhere.params);
      paramIndex = params.length + 1;
    } else if (segmentId) {
      const segments: { rules: unknown }[] = await prisma.$queryRawUnsafe(
        "SELECT rules FROM customer_segments WHERE id = $1",
        parseInt(segmentId)
      );
      if (segments.length === 0) return NextResponse.json({ error: "Segmento no encontrado" }, { status: 404 });
      const rules = segments[0].rules as Rule[];
      const built = buildWhereFromRules(rules);
      where = built.where;
      params.push(...built.params);
      paramIndex = params.length + 1;
    }

    const baseQuery = `FROM users u LEFT JOIN (SELECT "userId", COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_spent, MAX("createdAt") as last_order_date FROM orders GROUP BY "userId") o ON u.id = o."userId" ${where ? "WHERE " + where : ""}`;

    const countResult: { count: bigint }[] = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT u.id) as count ${baseQuery}`, ...params);
    const total = Number(countResult[0]?.count || 0);

    const customers = await prisma.$queryRawUnsafe(
      `SELECT u.id, u.name, u.email, u.phone, u."createdAt", COALESCE(o.order_count, 0)::int as order_count, COALESCE(o.total_spent, 0)::numeric as total_spent, o.last_order_date ${baseQuery} ORDER BY u."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params, limit, offset
    );

    return NextResponse.json({ customers, total, pages: Math.ceil(total / limit) });
  }

  // Get preset counts
  if (action === "presets") {
    const [allCount, newCount, recurringCount, vipCount, inactiveCount] = await Promise.all([
      prisma.$queryRawUnsafe<{ count: bigint }[]>("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'"),
      prisma.$queryRawUnsafe<{ count: bigint }[]>("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER' AND \"createdAt\" >= NOW() - INTERVAL '30 days'"),
      prisma.$queryRawUnsafe<{ count: bigint }[]>("SELECT COUNT(DISTINCT o.\"userId\") as count FROM (SELECT \"userId\", COUNT(*) as cnt FROM orders GROUP BY \"userId\" HAVING COUNT(*) >= 2) o"),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(*) as count FROM (SELECT o."userId" FROM orders o GROUP BY o."userId" HAVING SUM(o.total) >= (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY sub.total_spent) FROM (SELECT SUM(total) as total_spent FROM orders GROUP BY "userId") sub)) vip`),
      prisma.$queryRawUnsafe<{ count: bigint }[]>(`SELECT COUNT(DISTINCT u.id) as count FROM users u LEFT JOIN orders o ON u.id = o."userId" WHERE u.role = 'CUSTOMER' AND (o.id IS NULL OR u.id NOT IN (SELECT "userId" FROM orders WHERE "createdAt" >= NOW() - INTERVAL '60 days'))`)
    ]);

    return NextResponse.json({
      presets: [
        { key: "all", name: "Todos los clientes", description: "Todos los clientes registrados", count: Number(allCount[0]?.count || 0) },
        { key: "new", name: "Clientes nuevos", description: "Registrados en los últimos 30 días", count: Number(newCount[0]?.count || 0) },
        { key: "recurring", name: "Clientes recurrentes", description: "Con 2 o más pedidos", count: Number(recurringCount[0]?.count || 0) },
        { key: "vip", name: "Clientes VIP", description: "Top 10% por gasto total", count: Number(vipCount[0]?.count || 0) },
        { key: "inactive", name: "Inactivos", description: "Sin pedidos en 60+ días", count: Number(inactiveCount[0]?.count || 0) },
      ]
    });
  }

  // List custom segments
  const segments = await prisma.$queryRawUnsafe<{
    id: number; name: string; description: string; rules: unknown; customer_count: number; auto_update: boolean; created_at: Date; updated_at: Date;
  }[]>("SELECT * FROM customer_segments ORDER BY created_at DESC");

  return NextResponse.json({ segments });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, description, rules, auto_update } = body;

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  // Count matching customers
  const { where, params } = buildWhereFromRules(rules || []);
  const countQuery = `SELECT COUNT(DISTINCT u.id) as count FROM users u LEFT JOIN (SELECT "userId", COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_spent, MAX("createdAt") as last_order_date FROM orders GROUP BY "userId") o ON u.id = o."userId" ${where ? "WHERE " + where : ""}`;
  const result: { count: bigint }[] = await prisma.$queryRawUnsafe(countQuery, ...params);
  const customer_count = Number(result[0]?.count || 0);

  const inserted = await prisma.$queryRawUnsafe<{ id: number }[]>(
    "INSERT INTO customer_segments (name, description, rules, customer_count, auto_update, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id",
    name, description || "", JSON.stringify(rules || []), customer_count, auto_update !== false
  );

  return NextResponse.json({ id: inserted[0].id, customer_count });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.$queryRawUnsafe("DELETE FROM customer_segments WHERE id = $1", parseInt(id));
  return NextResponse.json({ ok: true });
}

// Types
interface Rule {
  field: string;
  operator: string;
  value: string;
}

function getPresetWhere(preset: string): { where: string; params: (string | number)[] } {
  switch (preset) {
    case "all":
      return { where: "u.role = 'CUSTOMER'", params: [] };
    case "new":
      return { where: "u.role = 'CUSTOMER' AND u.\"createdAt\" >= NOW() - INTERVAL '30 days'", params: [] };
    case "recurring":
      return { where: "COALESCE(o.order_count, 0) >= 2", params: [] };
    case "vip":
      return { where: `COALESCE(o.total_spent, 0) >= (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY sub.total_spent) FROM (SELECT COALESCE(SUM(total), 0) as total_spent FROM orders GROUP BY "userId") sub)`, params: [] };
    case "inactive":
      return { where: `u.role = 'CUSTOMER' AND (o.last_order_date IS NULL OR o.last_order_date < NOW() - INTERVAL '60 days')`, params: [] };
    default:
      return { where: "", params: [] };
  }
}

function buildWhereFromRules(rules: Rule[]): { where: string; params: (string | number)[] } {
  if (!rules || rules.length === 0) return { where: "", params: [] };

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  for (const rule of rules) {
    const { field, operator, value } = rule;
    let col = "";
    let isNumeric = false;
    let isDate = false;

    switch (field) {
      case "total_spent": col = "COALESCE(o.total_spent, 0)"; isNumeric = true; break;
      case "order_count": col = "COALESCE(o.order_count, 0)"; isNumeric = true; break;
      case "last_order_date": col = "o.last_order_date"; isDate = true; break;
      case "city": col = "u.phone"; break; // fallback - no city on users
      case "created_at": col = "u.\"createdAt\""; isDate = true; break;
      default: continue;
    }

    if (operator === "contains") {
      conditions.push(`CAST(${col} AS TEXT) ILIKE $${paramIndex}`);
      params.push(`%${value}%`);
      paramIndex++;
    } else if (isDate) {
      const op = operator === ">" ? ">" : operator === "<" ? "<" : "=";
      conditions.push(`${col} ${op} $${paramIndex}::timestamptz`);
      params.push(value);
      paramIndex++;
    } else if (isNumeric) {
      const op = operator === ">" ? ">" : operator === "<" ? "<" : "=";
      conditions.push(`${col} ${op} $${paramIndex}::numeric`);
      params.push(parseFloat(value));
      paramIndex++;
    } else {
      const op = operator === "=" ? "=" : operator === ">" ? ">" : "<";
      conditions.push(`${col} ${op} $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  return { where: conditions.join(" AND "), params };
}
