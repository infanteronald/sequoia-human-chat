import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Admin endpoint — trigger recovery messages for abandoned carts
// Called by cron or manually from panel
export async function POST(req: NextRequest) {
  try {
    // Find carts abandoned > 30 min ago, not yet recovered, not yet sent
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    const carts = await (prisma.abandonedCart as any).findMany({
      where: {
        recovered: false,
        recoverySent: false,
        phone: { not: null },
        createdAt: { lt: thirtyMinAgo },
      },
      take: 20,
    });

    if (carts.length === 0) {
      return NextResponse.json({ sent: 0, message: "No hay carritos para recuperar" });
    }

    let sent = 0;

    for (const cart of carts) {
      if (!cart.phone || !ACCESS_TOKEN) continue;

      // Format phone for WhatsApp (add 57 if needed)
      let phone = cart.phone.replace(/\D/g, "");
      if (phone.length === 10) phone = "57" + phone;
      if (!phone.startsWith("57")) phone = "57" + phone;

      const items = (cart.items as any[]) || [];
      const itemNames = items.slice(0, 3).map((i: any) => i.name).join(", ");
      const total = Number(cart.total);

      // Send WhatsApp text message (not template — templates need Meta approval)
      const message = `¡Hola${cart.name ? ` ${cart.name.split(" ")[0]}` : ""}! 👋\n\nNotamos que dejaste productos en tu carrito:\n🛒 ${itemNames}${items.length > 3 ? ` y ${items.length - 3} más` : ""}\n💰 Total: $${total.toLocaleString("es-CO")}\n\n🎁 Usa el código *VUELVE15* para un 15% de descuento.\n\n👉 Completa tu compra aquí: https://sequoiaspeed.com.co/carrito\n\n_Sequoia Speed — Tu equipamiento de moto_`;

      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { body: message },
          }),
        });

        if (res.ok) {
          sent++;
          await (prisma.abandonedCart as any).update({
            where: { id: cart.id },
            data: { recoverySent: true, recoverySentAt: new Date() },
          });
        }
      } catch {}
    }

    return NextResponse.json({ sent, total: carts.length });
  } catch (error) {
    console.error("Recovery error:", error);
    return NextResponse.json({ error: "Error en recuperación" }, { status: 500 });
  }
}
