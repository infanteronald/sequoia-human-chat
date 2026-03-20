import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — save abandoned cart data when user fills email/phone
export async function POST(req: NextRequest) {
  try {
    const { email, phone, name, items, total } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ ok: false });
    }

    // Upsert by email (most reliable identifier)
    if (email) {
      const existing = await (prisma.abandonedCart as any).findFirst({
        where: { email, recovered: false },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        await (prisma.abandonedCart as any).update({
          where: { id: existing.id },
          data: { phone, name, items: items || [], total: total || 0, updatedAt: new Date() },
        });
      } else {
        await (prisma.abandonedCart as any).create({
          data: { email, phone, name, items: items || [], total: total || 0 },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Abandoned cart error:", error);
    return NextResponse.json({ ok: false });
  }
}
