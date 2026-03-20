import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { text } = await req.json();
  
  const order = await prisma.order.findUnique({ where: { id }, select: { internalNotes: true } });
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const notes = (order.internalNotes as Prisma.JsonArray) || [];
  notes.push({ text, author: admin.email, createdAt: new Date().toISOString() });

  await prisma.order.update({ where: { id }, data: { internalNotes: notes as Prisma.InputJsonValue } });
  await prisma.orderEvent.create({
    data: { orderId: id, type: "note_added", detail: "Nota interna agregada", author: admin.email },
  });

  return NextResponse.json({ success: true, notes });
}
