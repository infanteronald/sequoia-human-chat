import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { trigger, action, config, isActive } = await req.json();
  const data: Record<string, unknown> = {};
  if (trigger !== undefined) data.trigger = trigger;
  if (action !== undefined) data.action = action;
  if (config !== undefined) data.config = config;
  if (isActive !== undefined) data.isActive = isActive;
  await prisma.automation.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.automation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
