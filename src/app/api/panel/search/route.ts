import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ orders: [], customers: [], products: [] });

  const [orders, customers, products] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { shippingName: { contains: q, mode: "insensitive" } },
          { shippingPhone: { contains: q } },
          { shippingAddress: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, orderNumber: true, status: true, total: true, shippingName: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { reference: { contains: q, mode: "insensitive" } },
          { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
        ],
      },
      select: { id: true, name: true, slug: true, reference: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    orders: orders.map(o => ({ ...o, total: Number(o.total) })),
    customers,
    products,
  });
}
