import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { blogPosts } from "@/lib/blog-posts";

const BASE_URL = "https://sequoiaspeed.com.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          select: { url: true },
          orderBy: { position: "asc" },
        },
      },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/nosotros`,
      lastModified: new Date("2025-03-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Only include categories that have active products (zero-waste SEO)
  const categoriesWithProducts = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.product.count({
        where: { isActive: true, category: { slug: cat.slug } },
      });
      return { ...cat, productCount: count };
    })
  );

  const categoryPages: MetadataRoute.Sitemap = categoriesWithProducts
    .filter((cat) => cat.productCount > 0)
    .map((cat) => ({
      url: `${BASE_URL}/categoria/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Exclude non-product placeholder pages from sitemap
  const excludeSlugs = ["reserva-de-producto"];
  const productPages: MetadataRoute.Sitemap = products
    .filter((prod) => !excludeSlugs.includes(prod.slug))
    .map((prod) => ({
      url: `${BASE_URL}/producto/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: prod.images.map((img) => `${BASE_URL}${img.url}`),
    }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
