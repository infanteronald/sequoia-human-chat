import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";

  let dateFilter: Date | null = null;
  const now = new Date();
  if (period === "24h") dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else if (period === "week") dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (period === "month") dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const where: Record<string, unknown> = {};
  if (dateFilter) where.createdAt = { gte: dateFilter };

  const carts = await (prisma.abandonedCart as any).findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const allCarts = await (prisma.abandonedCart as any).findMany({ where });
  const total = allCarts.length;
  const recovered = allCarts.filter((c: any) => c.recovered).length;
  const contacted = allCarts.filter((c: any) => c.recoverySent).length;
  const totalValue = allCarts.reduce((sum: number, c: any) => sum + Number(c.total || 0), 0);
  const recoveryRate = total > 0 ? Math.round((recovered / total) * 100) : 0;

  return NextResponse.json({
    carts: carts.map((c: any) => ({
      id: c.id,
      email: c.email,
      phone: c.phone,
      name: c.name,
      items: c.items,
      total: Number(c.total),
      recoverySent: c.recoverySent,
      recoverySentAt: c.recoverySentAt,
      recovered: c.recovered,
      createdAt: c.createdAt,
    })),
    stats: { total, recovered, contacted, totalValue, recoveryRate },
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { action, cartId } = await req.json();

  if (action === "send-reminder") {
    const cart = await (prisma.abandonedCart as any).findUnique({ where: { id: cartId } });
    if (!cart) return NextResponse.json({ error: "Carrito no encontrado" }, { status: 404 });
    if (!cart.phone) return NextResponse.json({ error: "Sin teléfono" }, { status: 400 });

    let phone = cart.phone.replace(/\D/g, "");
    if (phone.length === 10) phone = "57" + phone;
    if (!phone.startsWith("57")) phone = "57" + phone;

    const items = (cart.items as any[]) || [];
    const itemNames = items.slice(0, 3).map((i: any) => i.name).join(", ");
    const total = Number(cart.total);

    const message = `¡Hola${cart.name ? ` ${cart.name.split(" ")[0]}` : ""}! 👋\n\nNotamos que dejaste productos en tu carrito:\n🛒 ${itemNames}${items.length > 3 ? ` y ${items.length - 3} más` : ""}\n💰 Total: $${total.toLocaleString("es-CO")}\n\n🎁 Usa el código *VUELVE15* para un 15% de descuento.\n\n👉 Completa tu compra aquí: https://sequoiaspeed.com.co/carrito\n\n_Sequoia Speed — Tu equipamiento de moto_`;

    const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) return NextResponse.json({ error: "WhatsApp no configurado" }, { status: 400 });

    const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    });

    if (res.ok) {
      await (prisma.abandonedCart as any).update({
        where: { id: cartId },
        data: { recoverySent: true, recoverySentAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Error enviando WhatsApp" }, { status: 500 });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
