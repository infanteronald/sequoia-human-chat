import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ─── Addi API Integration ─── */
// Docs: https://api-docs-sandbox.addi.com
// Auth: POST {authUrl}/oauth/token → Bearer token
// Create: POST {apiUrl}/v1/online-applications → 301 redirect to Addi checkout

const ADDI_URLS = {
  sandbox: {
    auth: "https://auth.addi-staging.com/",
    api: "https://api.addi-staging.com/",
    audience: "https://api.staging.addi.com",
  },
  production: {
    auth: "https://auth.addi.com/",
    api: "https://api.addi.com/",
    audience: "https://api.addi.com",
  },
};

async function getAddiToken(clientId: string, clientSecret: string, isLive: boolean) {
  const env = isLive ? ADDI_URLS.production : ADDI_URLS.sandbox;
  const url = env.auth + "oauth/token";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      audience: env.audience,
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Addi auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, items, shipping, total, shippingCost = 0 } = body;

    // Get Addi config
    const config = await prisma.paymentConfig.findUnique({ where: { id: "addi" } });
    if (!config?.enabled) {
      return NextResponse.json({ error: "Addi no está habilitado" }, { status: 400 });
    }

    const addiConfig = config.config as Record<string, string>;
    if (!addiConfig.clientId || !addiConfig.clientSecret) {
      return NextResponse.json({ error: "Addi no está configurado" }, { status: 400 });
    }

    const isLive = addiConfig.isLive === "Producción";
    const env = isLive ? ADDI_URLS.production : ADDI_URLS.sandbox;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sequoiaspeed.com.co";

    // 1. Get OAuth token
    const token = await getAddiToken(addiConfig.clientId, addiConfig.clientSecret, isLive);

    // 2. Build application request
    const applicationBody = {
      orderId: orderId,
      description: `Pedido ${orderId} — Sequoia Speed`,
      totalAmount: total,
      shippingAmount: shippingCost,
      totalTaxesAmount: 0,
      currency: "COP",
      items: items.map((item: { id: string; name: string; quantity: number; price: number; image?: string }) => ({
        sku: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        tax: 0,
        pictureUrl: item.image ? `${baseUrl}${item.image}` : `${baseUrl}/logo.png`,
        category: "Indumentaria Moto",
      })),
      client: {
        idType: shipping.documentType || "CC",
        idNumber: shipping.document || "",
        firstName: shipping.name?.split(" ")[0] || "",
        lastName: shipping.name?.split(" ").slice(1).join(" ") || "",
        email: shipping.email || "",
        cellphone: shipping.phone?.replace(/\D/g, "") || "",
        cellphoneCountryCode: "57",
        address: {
          lineOne: shipping.address || "",
          city: shipping.city || "",
          country: "CO",
        },
      },
      shippingAddress: {
        lineOne: shipping.address || "",
        city: shipping.city || "",
        country: "CO",
      },
      billingAddress: {
        lineOne: shipping.address || "",
        city: shipping.city || "",
        country: "CO",
      },
      allyUrlRedirection: {
        logoUrl: `${baseUrl}/logo.png`,
        callbackUrl: `${baseUrl}/api/checkout/addi/callback`,
        redirectionUrl: `${baseUrl}/checkout/confirmacion?order=${orderId}&method=addi&total=${total}`,
      },
    };

    // 3. Create online application — Addi returns 301 redirect
    const res = await fetch(env.api + "v1/online-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(applicationBody),
      redirect: "manual", // Don't follow redirect, capture the URL
    });

    if (res.status === 301 || res.status === 302) {
      const redirectUrl = res.headers.get("location");
      if (redirectUrl) {
        return NextResponse.json({ redirectUrl });
      }
    }

    // Some Addi versions return 200 with URL in body
    if (res.ok) {
      const data = await res.json();
      if (data.url || data.redirectUrl) {
        return NextResponse.json({ redirectUrl: data.url || data.redirectUrl });
      }
      return NextResponse.json({ redirectUrl: data });
    }

    const errorText = await res.text();
    console.error("Addi application error:", res.status, errorText);
    return NextResponse.json({ error: `Error Addi: ${errorText}` }, { status: res.status });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Addi route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
