import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint - returns only enabled payment methods with their config
// (used by checkout page - no auth required)
export async function GET() {
  try {
    const methods = await prisma.paymentConfig.findMany({
      where: { enabled: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        config: true,
        position: true,
      },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json([], { status: 200 });
  }
}
