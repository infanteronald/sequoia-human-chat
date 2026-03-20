import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  delete data.id;
  delete data.productCount;
  delete data._count;
  delete data.createdAt;
  delete data.updatedAt;

  await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json({ error: "No se puede eliminar una categoría con productos" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
