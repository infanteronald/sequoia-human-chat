import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      icon: c.icon,
      order: c.order,
      isActive: c.isActive,
      parentId: c.parentId,
      productCount: c._count.products,
    })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      image: data.image || null,
      icon: data.icon || null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      parentId: data.parentId || null,
    },
  });

  return NextResponse.json({ category: { id: category.id } }, { status: 201 });
}
