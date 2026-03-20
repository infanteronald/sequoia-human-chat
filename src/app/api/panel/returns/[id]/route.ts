import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { status, notes, refundAmount } = await req.json();

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (notes !== undefined) data.notes = notes;
  if (refundAmount !== undefined) data.refundAmount = refundAmount;

  const ret = await prisma.return.update({ where: { id }, data });
  
  // If refunded, update order status
  if (status === "REFUNDED") {
    await prisma.order.update({ where: { id: ret.orderId }, data: { status: "REFUNDED" } });
    await prisma.orderEvent.create({
      data: { orderId: ret.orderId, type: "refund", detail: "Devolución completada y reembolsada", author: admin.email },
    });
  }

  return NextResponse.json({ success: true });
}
