import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Cache media URLs for 5 minutes (Meta URLs expire after a while)
const mediaCache = new Map<string, { url: string; expires: number }>();

// GET /api/whatsapp/media?id=MEDIA_ID
export async function GET(req: NextRequest) {
  const mediaId = req.nextUrl.searchParams.get("id");
  if (!mediaId) {
    return NextResponse.json({ error: "Media ID required" }, { status: 400 });
  }

  if (!ACCESS_TOKEN || ACCESS_TOKEN === "PENDIENTE_CONFIGURAR") {
    return NextResponse.json({ error: "WhatsApp not configured" }, { status: 500 });
  }

  try {
    // Check cache first
    const cached = mediaCache.get(mediaId);
    if (cached && cached.expires > Date.now()) {
      // Proxy the cached URL
      return await proxyMedia(cached.url);
    }

    // Step 1: Get the media URL from Meta
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    if (!metaRes.ok) {
      const err = await metaRes.text();
      console.error("[Media] Meta API error:", err);
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const metaData = await metaRes.json();
    const mediaUrl = metaData.url;

    if (!mediaUrl) {
      return NextResponse.json({ error: "No URL in response" }, { status: 404 });
    }

    // Cache for 4 minutes
    mediaCache.set(mediaId, { url: mediaUrl, expires: Date.now() + 4 * 60 * 1000 });

    // Clean old cache entries
    if (mediaCache.size > 500) {
      const now = Date.now();
      for (const [key, val] of mediaCache) {
        if (val.expires < now) mediaCache.delete(key);
      }
    }

    // Step 2: Download and proxy the actual media
    return await proxyMedia(mediaUrl);
  } catch (error: any) {
    console.error("[Media] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function proxyMedia(url: string): Promise<NextResponse> {
  const mediaRes = await fetch(url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  if (!mediaRes.ok) {
    return NextResponse.json({ error: "Failed to download media" }, { status: 502 });
  }

  const contentType = mediaRes.headers.get("content-type") || "application/octet-stream";
  const buffer = await mediaRes.arrayBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Length": String(buffer.byteLength),
    },
  });
}
