import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const events = await prisma.orderEvent.findMany({ where: { orderId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { type, detail } = await req.json();
  const event = await prisma.orderEvent.create({
    data: { orderId: id, type: type || "manual", detail, author: admin.email },
  });
  return NextResponse.json(event);
}
