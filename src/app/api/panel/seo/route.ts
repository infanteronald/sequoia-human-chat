import { NextRequest, NextResponse } from "next/server";
import pg from "pg";
import { prisma } from "@/lib/prisma";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "redirects";

    if (type === "redirects") {
      const { rows } = await pool.query("SELECT * FROM seo_redirects ORDER BY created_at DESC");
      return NextResponse.json({ redirects: rows });
    }

    if (type === "products") {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          metaTitle: true,
          metaDescription: true,
          isActive: true,
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ products });
    }

    if (type === "sitemap") {
      // Gather counts for sitemap overview
      const productCount = await prisma.product.count({ where: { isActive: true } });
      const categoryCount = await prisma.category.count({ where: { isActive: true } });
      const { rows: blogRows } = await pool.query("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'");
      const blogCount = parseInt(blogRows[0].count);

      // Get products for sitemap
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });

      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
        orderBy: { name: "asc" },
      });

      const { rows: blogPosts } = await pool.query(
        "SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY updated_at DESC LIMIT 20"
      );

      return NextResponse.json({
        sitemap: {
          counts: { products: productCount, categories: categoryCount, blog: blogCount, pages: 4 },
          products: products.map((p) => ({ url: `/producto/${p.slug}`, updatedAt: p.updatedAt })),
          categories: categories.map((c) => ({ url: `/categoria/${c.slug}` })),
          blog: blogPosts.map((b: any) => ({ url: `/blog/${b.slug}`, updatedAt: b.updated_at })),
          pages: [
            { url: "/" },
            { url: "/tienda" },
            { url: "/blog" },
            { url: "/contacto" },
          ],
        },
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "add_redirect") {
      const { from_path, to_path, status_code } = body;
      if (!from_path || !to_path) return NextResponse.json({ error: "Paths required" }, { status: 400 });

      const { rows } = await pool.query(
        "INSERT INTO seo_redirects (from_path, to_path, status_code, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [from_path, to_path, status_code || 301]
      );
      return NextResponse.json({ redirect: rows[0] }, { status: 201 });
    }

    if (action === "update_redirect") {
      const { id, from_path, to_path, status_code } = body;
      const { rows } = await pool.query(
        "UPDATE seo_redirects SET from_path = $1, to_path = $2, status_code = $3 WHERE id = $4 RETURNING *",
        [from_path, to_path, status_code, id]
      );
      return NextResponse.json({ redirect: rows[0] });
    }

    if (action === "delete_redirect") {
      const { id } = body;
      await pool.query("DELETE FROM seo_redirects WHERE id = $1", [id]);
      return NextResponse.json({ ok: true });
    }

    if (action === "update_product_seo") {
      const { id, metaTitle, metaDescription } = body;
      const product = await prisma.product.update({
        where: { id },
        data: { metaTitle: metaTitle || null, metaDescription: metaDescription || null },
        select: { id: true, name: true, slug: true, metaTitle: true, metaDescription: true },
      });
      return NextResponse.json({ product });
    }

    if (action === "generate_sitemap") {
      // Generate sitemap.xml
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      });
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
      });
      const { rows: blogPosts } = await pool.query(
        "SELECT slug, updated_at FROM blog_posts WHERE status = 'published'"
      );

      const baseUrl = "https://sequoiaspeed.com.co";
      const urls: string[] = [];

      // Static pages
      for (const page of ["/", "/tienda", "/blog", "/contacto"]) {
        urls.push(`  <url><loc>${baseUrl}${page}</loc><changefreq>weekly</changefreq><priority>${page === "/" ? "1.0" : "0.8"}</priority></url>`);
      }

      // Products
      for (const p of products) {
        urls.push(`  <url><loc>${baseUrl}/producto/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
      }

      // Categories
      for (const c of categories) {
        urls.push(`  <url><loc>${baseUrl}/categoria/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
      }

      // Blog
      for (const b of blogPosts) {
        urls.push(`  <url><loc>${baseUrl}/blog/${b.slug}</loc><lastmod>${new Date(b.updated_at).toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`);
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

      // Write to public folder
      const fs = await import("fs");
      const path = await import("path");
      const publicDir = path.join(process.cwd(), "public");
      fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf-8");

      return NextResponse.json({ ok: true, urlCount: urls.length, generatedAt: new Date().toISOString() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
