import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — get shipping rate for a department
export async function GET(req: NextRequest) {
  try {
    const department = req.nextUrl.searchParams.get("department");

    if (!department) {
      // Return all rates
      const rates = await prisma.shippingRate.findMany({
        where: { isActive: true },
        orderBy: { department: "asc" },
      });
      return NextResponse.json(rates);
    }

    const rate = await prisma.shippingRate.findUnique({
      where: { department },
    });

    if (!rate) {
      // Default rate for unknown departments
      return NextResponse.json({ rate: 20000, estimatedDays: "5-7 días hábiles" });
    }

    return NextResponse.json({ rate: Number(rate.rate), estimatedDays: rate.estimatedDays });
  } catch (error) {
    console.error("Shipping rate error:", error);
    return NextResponse.json({ rate: 15000, estimatedDays: "3-5 días hábiles" });
  }
}
