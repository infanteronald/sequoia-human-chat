import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const returns = await prisma.return.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ returns: returns.map(r => ({ ...r, refundAmount: r.refundAmount ? Number(r.refundAmount) : null })) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { reason, notes, refundAmount } = await req.json();
  
  const ret = await prisma.return.create({
    data: { orderId: id, reason, notes, refundAmount: refundAmount || null },
  });

  await prisma.orderEvent.create({
    data: { orderId: id, type: "return_created", detail: `Devolución creada: ${reason}`, author: admin.email },
  });

  return NextResponse.json(ret);
}
