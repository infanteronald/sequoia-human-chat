import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — get upsell products for checkout
export async function GET(req: NextRequest) {
  try {
    const excludeIds = req.nextUrl.searchParams.get("exclude")?.split(",") || [];
    const categoryId = req.nextUrl.searchParams.get("category") || undefined;

    // Get random active products (excluding cart items) under $60k for impulse buys
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: excludeIds },
        price: { lte: 60000 },
        ...(categoryId ? { categoryId } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        images: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 20,
    });

    // Shuffle and take 4
    const shuffled = products.sort(() => Math.random() - 0.5).slice(0, 4);
    const formatted = shuffled.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.images[0]?.url || "/products/placeholder.jpg",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Upsell error:", error);
    return NextResponse.json([]);
  }
}
