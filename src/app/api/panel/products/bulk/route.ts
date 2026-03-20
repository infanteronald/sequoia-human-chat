import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const q = searchParams.get("q") || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        compareAtPrice: true,
        isActive: true,
        reference: true,
        images: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
        variants: {
          select: { stock: true },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const mapped = products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    isActive: p.isActive,
    reference: p.reference,
    image: p.images[0]?.url || null,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }));

  return NextResponse.json({ products: mapped, total, pages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { changes } = body;

  if (!changes || !Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json({ error: "No hay cambios" }, { status: 400 });
  }

  let updated = 0;

  for (const change of changes) {
    const { id, name, price, compareAtPrice, isActive, stock } = change;
    if (!id) continue;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = price;
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice;
    if (isActive !== undefined) data.isActive = isActive;

    if (Object.keys(data).length > 0) {
      await prisma.product.update({ where: { id }, data });
    }

    // Update stock across all variants (distribute evenly or set on first)
    if (stock !== undefined) {
      const variants = await prisma.productVariant.findMany({ where: { productId: id }, orderBy: { id: "asc" } });
      if (variants.length > 0) {
        // Set stock on first variant, others to 0 if single variant, or distribute
        if (variants.length === 1) {
          await prisma.productVariant.update({ where: { id: variants[0].id }, data: { stock } });
        } else {
          const perVariant = Math.floor(stock / variants.length);
          const remainder = stock % variants.length;
          for (let i = 0; i < variants.length; i++) {
            await prisma.productVariant.update({
              where: { id: variants[i].id },
              data: { stock: perVariant + (i === 0 ? remainder : 0) },
            });
          }
        }
      }
    }

    updated++;
  }

  return NextResponse.json({ updated });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { ids } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No hay IDs" }, { status: 400 });
  }

  // Delete related records first, then products
  for (const id of ids) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  }

  return NextResponse.json({ deleted: ids.length });
}

// Bulk action endpoint
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { action, ids, value } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No hay IDs seleccionados" }, { status: 400 });
  }

  switch (action) {
    case "set_price": {
      const price = parseFloat(value);
      if (isNaN(price)) return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { price } });
      return NextResponse.json({ updated: ids.length });
    }

    case "percent_price": {
      const percent = parseFloat(value);
      if (isNaN(percent)) return NextResponse.json({ error: "Porcentaje inválido" }, { status: 400 });
      const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
      for (const p of products) {
        const newPrice = Math.round(Number(p.price) * (1 + percent / 100));
        await prisma.product.update({ where: { id: p.id }, data: { price: Math.max(0, newPrice) } });
      }
      return NextResponse.json({ updated: ids.length });
    }

    case "set_stock": {
      const stock = parseInt(value);
      if (isNaN(stock)) return NextResponse.json({ error: "Stock inválido" }, { status: 400 });
      for (const id of ids) {
        const variants = await prisma.productVariant.findMany({ where: { productId: id } });
        if (variants.length === 1) {
          await prisma.productVariant.update({ where: { id: variants[0].id }, data: { stock } });
        } else if (variants.length > 1) {
          const perVariant = Math.floor(stock / variants.length);
          const remainder = stock % variants.length;
          for (let i = 0; i < variants.length; i++) {
            await prisma.productVariant.update({ where: { id: variants[i].id }, data: { stock: perVariant + (i === 0 ? remainder : 0) } });
          }
        }
      }
      return NextResponse.json({ updated: ids.length });
    }

    case "activate": {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
      return NextResponse.json({ updated: ids.length });
    }

    case "deactivate": {
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
      return NextResponse.json({ updated: ids.length });
    }

    default:
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }
}
