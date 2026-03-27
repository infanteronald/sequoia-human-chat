import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shipping, paymentMethod, shippingCost = 0, couponCode, discount = 0 } = body;

    if (!items?.length || !shipping?.name || !paymentMethod) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Validate payment method is enabled
    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { id: paymentMethod },
    });

    if (!paymentConfig?.enabled) {
      return NextResponse.json({ error: "Método de pago no disponible" }, { status: 400 });
    }

    // Server-side price lookup to prevent price manipulation
    const productIds = items.map((item: { id: string }) => item.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const priceMap = new Map(products.map((p: { id: string; price: any }) => [p.id, Number(p.price)]));

    // Validate all products exist
    for (const item of items) {
      if (!priceMap.has(item.id)) {
        return NextResponse.json({ error: "Producto no encontrado: " + item.id }, { status: 400 });
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: { id: string; price: number; quantity: number }) => sum + (priceMap.get(item.id) || 0) * item.quantity,
      0
    );

    // Validate coupon server-side if provided
    let validatedDiscount = 0;
    if (couponCode) {
      const coupon = await (prisma as any).coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
        const notExhausted = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const meetsMinimum = subtotal >= Number(coupon.minPurchase || 0);

        if (notExpired && notExhausted && meetsMinimum) {
          if (coupon.type === "percentage") {
            validatedDiscount = Math.round(subtotal * (Number(coupon.value) / 100));
          } else {
            validatedDiscount = Number(coupon.value);
          }
          // Increment usage count
          await (prisma as any).coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = Math.max(0, subtotal + shippingCost - validatedDiscount);

    // Check session first, then find/create by email
    let user = null;
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionMatch = cookieHeader.match(/session-token=([^;]+)/);
    if (sessionMatch) {
      const session = await prisma.session.findUnique({
        where: { sessionToken: sessionMatch[1] },
        include: { user: true },
      });
      if (session && session.expires > new Date()) {
        user = session.user;
      }
    }
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: shipping.email } });
    }
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: shipping.email,
          name: shipping.name,
          phone: shipping.phone,
        },
      });
    }

    // Sequential order number (Shopify style)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    });
    let nextNum = 1001;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/^(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      } else {
        // Legacy format: count existing orders + 1001
        const count = await prisma.order.count();
        nextNum = count + 1;
      }
    }
    const orderNumber = String(nextNum);

    // Map checkout method id to PaymentMethod enum
    const methodMap: Record<string, string> = {
      nequi: "NEQUI",
      bancolombia: "BANCOLOMBIA",
      bold: "BOLD",
      mercadolibre: "MERCADOLIBRE",
      transfer: "TRANSFER",
      breb: "BREB",
      addi: "ADDI",
    };

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        subtotal,
        shipping: shippingCost,
        discount: validatedDiscount,
        total,
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingZip: shipping.zip || "",
        notes: shipping.notes,
        items: {
          create: items.map(
            (item: {
              id: string;
              name: string;
              price: number;
              quantity: number;
              variantId?: string;
            }) => ({
              productId: item.id,
              variantId: item.variantId || null,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })
          ),
        },
        payment: {
          create: {
            method: (methodMap[paymentMethod] || "TRANSFER") as any,
            status: "PENDING",
            amount: total,
          },
        },
      },
    });

    // Create timeline event
    const couponNote = validatedDiscount > 0 ? ` Cupón: ${couponCode} (-$${validatedDiscount.toLocaleString("es-CO")})` : "";
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: "ORDER_CREATED",
        detail: `Pedido creado. Método: ${paymentConfig.name}.${couponNote}`,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      },
    });

    // Mark abandoned cart as recovered if exists
    if (shipping.email) {
      try {
        const abandonedCart = await (prisma as any).abandonedCart.findFirst({
          where: { email: shipping.email, recovered: false },
          orderBy: { createdAt: "desc" },
        });
        if (abandonedCart) {
          await (prisma as any).abandonedCart.update({
            where: { id: abandonedCart.id },
            data: { recovered: true },
          });
        }
      } catch {}
    }

    // ── Send emails (non-blocking) ──
    const paymentLabels: Record<string, string> = {
      nequi: "Nequi",
      bancolombia: "Bancolombia",
      breb: "Llave Bre-B",
      bold: "Bold (Tarjeta)",
      mercadolibre: "MercadoLibre",
      addi: "Addi",
      transfer: "Transferencia",
    };
    const pLabel = paymentLabels[paymentMethod] || paymentConfig.name;
    
    // Build payment instructions for manual methods
    let paymentInstructions = "";
    if (paymentMethod === "nequi" && paymentConfig.config) {
      const cfg = typeof paymentConfig.config === "string" ? JSON.parse(paymentConfig.config) : paymentConfig.config;
      paymentInstructions = `Envía ${total.toLocaleString("es-CO")} al número Nequi: ${cfg.nequiNumber}. Luego envía el comprobante por WhatsApp.`;
    } else if (paymentMethod === "bancolombia" && paymentConfig.config) {
      const cfg = typeof paymentConfig.config === "string" ? JSON.parse(paymentConfig.config) : paymentConfig.config;
      paymentInstructions = `Consigna ${total.toLocaleString("es-CO")} a la cuenta ${cfg.accountType} ${cfg.accountNumber} de ${cfg.bankName} a nombre de ${cfg.accountHolder}. Luego envía el comprobante por WhatsApp.`;
    } else if (paymentMethod === "breb" && paymentConfig.config) {
      const cfg = typeof paymentConfig.config === "string" ? JSON.parse(paymentConfig.config) : paymentConfig.config;
      paymentInstructions = `Envía ${total.toLocaleString("es-CO")} a la llave Bre-B: ${cfg.brebKey}. Luego envía el comprobante por WhatsApp.`;
    }

    // Email to customer
    if (shipping.email) {
      sendOrderConfirmation(shipping.email, {
        orderNumber: order.orderNumber,
        customerName: shipping.name,
        items: items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price, variantName: i.variantName, image: i.image ? `https://sequoiaspeed.com.co${i.image}` : undefined })),
        subtotal, shipping: shippingCost, discount: validatedDiscount, total,
        paymentMethod, paymentLabel: pLabel,
        shippingAddress: shipping.address, city: shipping.city, department: shipping.state,
        paymentInstructions,
      }).catch(err => console.error("Email error:", err));
    }

    // Email to admin
    sendAdminNewOrder({
      orderNumber: order.orderNumber,
      customerName: shipping.name,
      total, paymentLabel: pLabel,
      itemCount: items.length,
    }).catch(err => console.error("Admin email error:", err));

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error procesando el pedido" }, { status: 500 });
  }
}
