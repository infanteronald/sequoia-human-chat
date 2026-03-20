import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const automations = await prisma.automation.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ automations });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { trigger, action, config } = await req.json();
  const automation = await prisma.automation.create({ data: { trigger, action, config: config || {} } });
  return NextResponse.json(automation);
}
