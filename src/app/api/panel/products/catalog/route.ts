import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        products: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            reference: true,
            images: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                url: true,
                alt: true,
                isCover: true,
              },
            },
          },
        },
      },
    });

    // Filter out empty categories and format
    const result = categories
      .filter((cat) => cat.products.length > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat.products.length,
        products: cat.products.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          reference: p.reference,
          cover: p.images.find((i) => i.isCover)?.url || p.images[0]?.url || null,
          images: p.images.map((i) => ({
            url: i.url,
            alt: i.alt || p.name,
          })),
        })),
      }));

    return NextResponse.json({ categories: result });
  } catch (error: any) {
    console.error("Catalog error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
