import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";

  const where: Record<string, unknown> = { isActive: true };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (filter === "out") where.stock = 0;
  if (filter === "low") where.stock = { gt: 0, lt: 5 };

  const variants = await prisma.productVariant.findMany({
    where,
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { stock: "asc" },
  });

  return NextResponse.json({
    variants: variants.map((v) => ({
      id: v.id,
      product: v.product.name,
      productSlug: v.product.slug,
      variant: v.name,
      sku: v.sku,
      stock: v.stock,
    })),
  });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, stock } = await req.json();
  await prisma.productVariant.update({ where: { id }, data: { stock } });
  return NextResponse.json({ success: true });
}
