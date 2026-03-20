import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — validate a coupon code
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, error: "Código requerido" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Cupón inválido o expirado" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Este cupón ha expirado" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Este cupón ha alcanzado su límite de usos" });
    }

    const minPurchase = Number(coupon.minPurchase);
    if (subtotal < minPurchase) {
      return NextResponse.json({
        valid: false,
        error: `Compra mínima de $${minPurchase.toLocaleString("es-CO")} para este cupón`,
      });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round(subtotal * (Number(coupon.value) / 100));
    } else {
      discount = Number(coupon.value);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discount,
      description:
        coupon.type === "percentage"
          ? `${Number(coupon.value)}% de descuento`
          : `$${Number(coupon.value).toLocaleString("es-CO")} de descuento`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, error: "Error validando cupón" });
  }
}
