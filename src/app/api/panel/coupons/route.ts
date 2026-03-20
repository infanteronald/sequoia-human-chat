import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  user: "postgres",
  password: "SqPost2026xKv9mR",
  database: "sequoiaspeed",
  max: 5,
});

function row(r: any) {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: Number(r.value),
    description: r.description || "",
    minPurchase: Number(r.min_purchase || 0),
    maxUses: r.max_uses ?? null,
    usedCount: r.used_count ?? 0,
    expiresAt: r.expires_at,
    isActive: r.is_active,
    createdAt: r.created_at,
    discountType: r.discount_type || "code",
    appliesTo: r.applies_to || "all",
    minQuantity: r.min_quantity || 0,
    perCustomerUses: r.per_customer_uses ?? null,
    startDate: r.start_date ?? null,
    canCombine: r.can_combine ?? false,
    freeShipping: r.free_shipping ?? false,
    buyXQuantity: r.buy_x_quantity ?? null,
    getYQuantity: r.get_y_quantity ?? null,
    customerEligibility: r.customer_eligibility || "all",
  };
}

export async function GET() {
  try {
    const { rows } = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return NextResponse.json(rows.map(row));
  } catch (error) {
    console.error("Coupons error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, code, type, value, description, minPurchase, maxUses, expiresAt, isActive,
      discountType, appliesTo, minQuantity, perCustomerUses, startDate,
      canCombine, freeShipping, buyXQuantity, getYQuantity, customerEligibility,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Codigo, tipo y valor son requeridos" }, { status: 400 });
    }

    if (id) {
      const { rows } = await pool.query(
        `UPDATE coupons SET
          code=$1, type=$2, value=$3, description=$4, min_purchase=$5, max_uses=$6,
          expires_at=$7, is_active=$8, updated_at=now(),
          discount_type=$9, applies_to=$10, min_quantity=$11, per_customer_uses=$12,
          start_date=$13, can_combine=$14, free_shipping=$15, buy_x_quantity=$16,
          get_y_quantity=$17, customer_eligibility=$18
        WHERE id=$19 RETURNING *`,
        [
          code.toUpperCase(), type, value, description || "", minPurchase || 0,
          maxUses || null, expiresAt ? new Date(expiresAt) : null, isActive !== false,
          discountType || "code", appliesTo || "all", minQuantity || 0,
          perCustomerUses || null, startDate ? new Date(startDate) : null,
          canCombine ?? false, freeShipping ?? false, buyXQuantity || null,
          getYQuantity || null, customerEligibility || "all", id,
        ]
      );
      return NextResponse.json(row(rows[0]));
    } else {
      const { rows } = await pool.query(
        `INSERT INTO coupons (code, type, value, description, min_purchase, max_uses, expires_at, is_active,
          discount_type, applies_to, min_quantity, per_customer_uses, start_date,
          can_combine, free_shipping, buy_x_quantity, get_y_quantity, customer_eligibility)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
        [
          code.toUpperCase(), type, value, description || "", minPurchase || 0,
          maxUses || null, expiresAt ? new Date(expiresAt) : null, isActive !== false,
          discountType || "code", appliesTo || "all", minQuantity || 0,
          perCustomerUses || null, startDate ? new Date(startDate) : null,
          canCombine ?? false, freeShipping ?? false, buyXQuantity || null,
          getYQuantity || null, customerEligibility || "all",
        ]
      );
      return NextResponse.json(row(rows[0]));
    }
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un cupon con ese codigo" }, { status: 400 });
    }
    console.error("Coupon error:", error);
    return NextResponse.json({ error: "Error guardando cupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await pool.query("DELETE FROM coupons WHERE id=$1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Error eliminando cupon" }, { status: 500 });
  }
}
