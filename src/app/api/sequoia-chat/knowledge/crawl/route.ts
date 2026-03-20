import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function POST(req: NextRequest) {
  try {
    const { url, category } = await req.json();
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    // Fetch the URL
    const res = await fetch(url, {
      headers: { "User-Agent": "SequoiaChat/1.0 (Knowledge Crawler)" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 400 });

    const html = await res.text();

    // Extract text from HTML: remove scripts, styles, tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Could not extract meaningful content from URL" }, { status: 400 });
    }

    // Truncate if too long (max ~8000 tokens worth)
    if (text.length > 32000) text = text.substring(0, 32000) + "\n\n[... contenido truncado]";

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

    const tokensEstimate = Math.ceil(text.length / 4);

    const result = await pool.query(
      `INSERT INTO knowledge_base (title, content, source_type, source_url, category, tokens_estimate)
       VALUES ($1, $2, 'url', $3, $4, $5) RETURNING *`,
      [title, text, url, category || "Web", tokensEstimate]
    );

    return NextResponse.json({
      item: result.rows[0],
      preview: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
      totalChars: text.length,
      tokensEstimate,
    });
  } catch (e: any) {
    console.error("[KB Crawl]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
