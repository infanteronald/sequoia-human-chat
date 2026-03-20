import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: { orderBy: { name: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    weight: product.weight ? Number(product.weight) : null,
    variants: product.variants.map((v) => ({
      ...v,
      priceModifier: Number(v.priceModifier),
    })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  // Handle variants update separately
  if (data.variants) {
    // Delete removed variants, upsert existing
    const existingVariants = await prisma.productVariant.findMany({ where: { productId: id } });
    const incomingIds = data.variants.filter((v: { id?: string }) => v.id).map((v: { id: string }) => v.id);
    const toDelete = existingVariants.filter((v) => !incomingIds.includes(v.id));

    await prisma.$transaction([
      ...toDelete.map((v) => prisma.productVariant.delete({ where: { id: v.id } })),
      ...data.variants.map((v: { id?: string; name: string; sku?: string; stock?: number; priceModifier?: number }) =>
        v.id
          ? prisma.productVariant.update({
              where: { id: v.id },
              data: { name: v.name, sku: v.sku || null, stock: v.stock ?? 0, priceModifier: v.priceModifier ?? 0 },
            })
          : prisma.productVariant.create({
              data: { productId: id, name: v.name, sku: v.sku || null, stock: v.stock ?? 0, priceModifier: v.priceModifier ?? 0 },
            })
      ),
    ]);
    delete data.variants;
  }

  // Remove non-product fields
  delete data.images;
  delete data.category;
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.prestashopId;

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json({ success: true, slug: product.slug });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
