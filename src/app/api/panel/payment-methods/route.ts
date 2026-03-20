import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const methods = await prisma.paymentConfig.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, enabled, config, position } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof enabled === "boolean") data.enabled = enabled;
    if (config !== undefined) data.config = config;
    if (typeof position === "number") data.position = position;

    const updated = await prisma.paymentConfig.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
