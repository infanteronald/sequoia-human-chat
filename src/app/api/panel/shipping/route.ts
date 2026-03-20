import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — list all shipping rates
export async function GET() {
  try {
    const rates = await prisma.shippingRate.findMany({
      orderBy: { department: "asc" },
    });
    return NextResponse.json(rates);
  } catch (error) {
    console.error("Shipping rates error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST — update a shipping rate
export async function POST(req: NextRequest) {
  try {
    const { department, rate, estimatedDays, isActive } = await req.json();

    if (!department) {
      return NextResponse.json({ error: "Departamento requerido" }, { status: 400 });
    }

    const updated = await prisma.shippingRate.upsert({
      where: { department },
      update: {
        ...(rate !== undefined ? { rate } : {}),
        ...(estimatedDays !== undefined ? { estimatedDays } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      create: {
        id: department.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        department,
        rate: rate || 15000,
        estimatedDays: estimatedDays || "3-5 días hábiles",
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update shipping rate error:", error);
    return NextResponse.json({ error: "Error actualizando tarifa" }, { status: 500 });
  }
}
