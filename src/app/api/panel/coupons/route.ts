import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all coupons
export async function GET() {
  try {
    const coupons = await (prisma as any).coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    const formatted = coupons.map((c: any) => ({
      ...c,
      value: Number(c.value),
      minPurchase: Number(c.minPurchase),
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Coupons error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — create or update coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, code, type, value, minPurchase, maxUses, expiresAt, isActive, description } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Código, tipo y valor son requeridos" }, { status: 400 });
    }

    if (id) {
      // Update existing
      const updated = await (prisma as any).coupon.update({
        where: { id },
        data: {
          code: code.toUpperCase(),
          type,
          value,
          description: description || "",
          minPurchase: minPurchase || 0,
          maxUses: maxUses || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: isActive !== false,
        },
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await (prisma as any).coupon.create({
        data: {
          code: code.toUpperCase(),
          type,
          value,
          description: description || "",
          minPurchase: minPurchase || 0,
          maxUses: maxUses || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: isActive !== false,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un cupón con ese código" }, { status: 400 });
    }
    console.error("Coupon error:", error);
    return NextResponse.json({ error: "Error guardando cupón" }, { status: 500 });
  }
}

// DELETE — delete coupon
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await (prisma as any).coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Error eliminando cupón" }, { status: 500 });
  }
}
