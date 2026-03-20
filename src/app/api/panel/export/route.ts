import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "orders";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  let csv = "";

  if (type === "orders") {
    const where: Record<string, unknown> = {};
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); (where.createdAt as Record<string, unknown>).lte = d; }
    }
    const orders = await prisma.order.findMany({
      where, include: { user: { select: { name: true, email: true } }, payment: { select: { method: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = "Pedido,Cliente,Email,Total,Estado,Ciudad,Transportadora,Guia,Pago,Estado Pago,Fecha\n";
    csv += orders.map(o =>
      `${o.orderNumber},"${o.user.name || ""}",${o.user.email},${Number(o.total)},${o.status},"${o.shippingCity || ""}",${o.carrier || ""},${o.trackingNumber || ""},${o.payment?.method || ""},${o.payment?.status || ""},${o.createdAt.toISOString().split("T")[0]}`
    ).join("\n");
  } else if (type === "customers") {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = "Nombre,Email,Telefono,Pedidos,Total Gastado,Tags,Registro\n";
    csv += users.map(u =>
      `"${u.name || ""}",${u.email},${u.phone || ""},${u._count.orders},${u.orders.reduce((s, o) => s + Number(o.total), 0)},"${u.tags.join(", ")}",${u.createdAt.toISOString().split("T")[0]}`
    ).join("\n");
  } else if (type === "products") {
    const products = await prisma.product.findMany({
      include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
      orderBy: { name: "asc" },
    });
    csv = "Nombre,Referencia,Precio,Costo,Categoria,Stock Total,Activo\n";
    csv += products.map(p =>
      `"${p.name}",${p.reference || ""},${Number(p.price)},${p.costPrice ? Number(p.costPrice) : ""},"${p.category.name}",${p.variants.reduce((s, v) => s + v.stock, 0)},${p.isActive}`
    ).join("\n");
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
