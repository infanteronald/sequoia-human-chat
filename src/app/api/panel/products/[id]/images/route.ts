import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const maxPos = await prisma.productImage.aggregate({
    _max: { position: true },
    where: { productId: id },
  });

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: data.url,
      alt: data.alt || null,
      position: (maxPos._max.position || 0) + 1,
      isCover: data.isCover || false,
    },
  });

  if (data.isCover) {
    await prisma.productImage.updateMany({
      where: { productId: id, id: { not: image.id } },
      data: { isCover: false },
    });
  }

  return NextResponse.json({ image }, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { images } = await req.json();

  await prisma.$transaction(
    images.map((img: { id: string; position: number; isCover: boolean; alt: string | null }) =>
      prisma.productImage.update({
        where: { id: img.id },
        data: { position: img.position, isCover: img.isCover, alt: img.alt },
      })
    )
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "imageId requerido" }, { status: 400 });

  await prisma.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}
