import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { slug: category };
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.images[0]?.url || null,
      category: p.category.name,
      categorySlug: p.category.slug,
      reference: p.reference,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      reference: data.reference || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      costPrice: data.costPrice || null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      weight: data.weight || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      subtitle: data.subtitle || null,
      benefits: data.benefits || null,
      reviews: data.reviews || null,
      faq: data.faq || null,
      categoryId: data.categoryId,
    },
  });

  return NextResponse.json({ product: { id: product.id, slug: product.slug } }, { status: 201 });
}
