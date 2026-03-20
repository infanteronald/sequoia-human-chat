import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const returns = await prisma.return.findMany({
    where,
    include: { order: { select: { orderNumber: true, user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    returns: returns.map(r => ({
      ...r,
      refundAmount: r.refundAmount ? Number(r.refundAmount) : null,
      customer: r.order.user.name || r.order.user.email,
      orderNumber: r.order.orderNumber,
    })),
  });
}
