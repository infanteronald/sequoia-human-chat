import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; expires: number }>();

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  try {
    // Check cache (10 min)
    const cached = cache.get(url);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
        "Accept": "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "Not HTML" }, { status: 400 });
    }

    // Only read first 50KB to extract meta tags
    const text = await res.text();
    const head = text.substring(0, 50000);

    const getMetaContent = (property: string): string => {
      // Try og: tags first, then twitter:, then regular meta
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, "i"),
        new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, "i"),
      ];
      if (property === "description") {
        patterns.push(
          new RegExp(`<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']`, "i"),
          new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']`, "i"),
        );
      }
      for (const pattern of patterns) {
        const match = head.match(pattern);
        if (match) return match[1];
      }
      return "";
    };

    // Extract title
    let title = getMetaContent("title");
    if (!title) {
      const titleMatch = head.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = titleMatch[1];
    }

    const description = getMetaContent("description");
    let image = getMetaContent("image");
    const siteName = getMetaContent("site_name");

    // Make image URL absolute
    if (image && !image.startsWith("http")) {
      const urlObj = new URL(url);
      image = image.startsWith("/") ? `${urlObj.origin}${image}` : `${urlObj.origin}/${image}`;
    }

    // Get favicon
    let favicon = "";
    const faviconMatch = head.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
      || head.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
    if (faviconMatch) {
      favicon = faviconMatch[1];
      if (!favicon.startsWith("http")) {
        const urlObj = new URL(url);
        favicon = favicon.startsWith("/") ? `${urlObj.origin}${favicon}` : `${urlObj.origin}/${favicon}`;
      }
    }

    const data = {
      url,
      title: decodeEntities(title).substring(0, 200),
      description: decodeEntities(description).substring(0, 300),
      image,
      siteName: decodeEntities(siteName),
      favicon,
      domain: new URL(url).hostname,
    };

    // Cache for 10 minutes
    cache.set(url, { data, expires: Date.now() + 10 * 60 * 1000 });

    // Clean old entries
    if (cache.size > 200) {
      const now = Date.now();
      for (const [key, val] of cache) {
        if (val.expires < now) cache.delete(key);
      }
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .trim();
}
