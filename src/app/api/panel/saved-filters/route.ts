import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const filters = await prisma.savedFilter.findMany({ where: { userId: admin.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ filters });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { name, filters } = await req.json();
  const saved = await prisma.savedFilter.create({ data: { userId: admin.id, name, filters } });
  return NextResponse.json(saved);
}
