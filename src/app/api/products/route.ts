import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Record<string, unknown> = { isActive: true };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { reference: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { where: { isCover: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
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
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}
