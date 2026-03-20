import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      const { rows } = await pool.query("SELECT * FROM blog_posts WHERE id = $1", [id]);
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ post: rows[0] });
    }

    let query = "SELECT id, title, slug, excerpt, author, status, tags, published_at, created_at, updated_at FROM blog_posts";
    const params: string[] = [];

    if (status && status !== "all") {
      query += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC";

    const { rows } = await pool.query(query, params);
    return NextResponse.json({ posts: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, content, cover_image, author, status, tags, seo_title, seo_description } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const publishedAt = status === "published" ? new Date().toISOString() : null;
    const tagsArray = tags && tags.length ? tags : [];

    const { rows } = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, status, tags, seo_title, seo_description, published_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) RETURNING *`,
      [title, slug, excerpt || null, content || null, cover_image || null, author || "Sequoia Speed", status || "draft", tagsArray, seo_title || null, seo_description || null, publishedAt]
    );

    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (e: any) {
    if (e.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, slug, excerpt, content, cover_image, author, status, tags, seo_title, seo_description } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // If changing to published and wasn't before, set published_at
    const { rows: existing } = await pool.query("SELECT status FROM blog_posts WHERE id = $1", [id]);
    const publishedAt = status === "published" && existing[0]?.status !== "published" ? new Date().toISOString() : undefined;

    const setClauses: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const fields: Record<string, any> = { title, slug, excerpt, content, cover_image, author, status, seo_title, seo_description };
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        setClauses.push(`${key} = $${idx}`);
        params.push(val);
        idx++;
      }
    }

    if (tags !== undefined) {
      setClauses.push(`tags = $${idx}`);
      params.push(tags);
      idx++;
    }

    if (publishedAt) {
      setClauses.push(`published_at = $${idx}`);
      params.push(publishedAt);
      idx++;
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE blog_posts SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    return NextResponse.json({ post: rows[0] });
  } catch (e: any) {
    if (e.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await pool.query("DELETE FROM blog_posts WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
