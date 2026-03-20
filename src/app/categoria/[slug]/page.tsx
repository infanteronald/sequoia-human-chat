import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CategoryTracker } from "@/components/CategoryTracker";
import { categoryFaqs } from "@/lib/category-faqs";
import { relatedCategories, relatedBlogPosts } from "@/lib/category-links";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}


export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const [category, firstProduct, productCount] = await Promise.all([
    prisma.category.findUnique({ where: { slug }, include: { children: { where: { isActive: true }, select: { id: true } } } }),
    prisma.product.findFirst({
      where: { isActive: true, category: { slug } },
      include: { images: { where: { isCover: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { isActive: true, category: { slug } } }),
  ]);
  if (!category) return {};

  // Also count products in subcategories
  let totalProducts = productCount;
  if (category.children.length > 0) {
    const subCount = await prisma.product.count({
      where: { isActive: true, categoryId: { in: category.children.map((c: { id: string }) => c.id) } },
    });
    totalProducts += subCount;
  }

  const title = page > 1 ? `${category.name} - Página ${page}` : category.name;
  const description =
    category.description ||
    `Compra ${category.name} para moto en Sequoia Speed. Envío a toda Colombia.`;

  return {
    title,
    description,
    // noindex empty categories to avoid thin content (zero-waste SEO)
    ...(totalProducts === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: page > 1 ? `/categoria/${slug}?page=${page}` : `/categoria/${slug}`,
    },
    openGraph: {
      title: `${category.name} | Sequoia Speed`,
      description,
      type: "website",
      url: page > 1 ? `https://sequoiaspeed.com.co/categoria/${slug}?page=${page}` : `https://sequoiaspeed.com.co/categoria/${slug}`,
      images: firstProduct?.images[0]?.url
        ? [{ url: firstProduct.images[0].url, width: 800, height: 800, alt: category.name }]
        : [{ url: "/logo.png", width: 800, height: 600, alt: "Sequoia Speed" }],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const perPage = 12;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: { where: { isActive: true } } },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, categoryId: { in: categoryIds } },
      include: { images: { where: { isCover: true }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({
      where: { isActive: true, categoryId: { in: categoryIds } },
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const baseUrl = "https://sequoiaspeed.com.co";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${baseUrl}/categoria/${category.slug}`,
      },
    ],
  };

  // Calculate price range for AggregateOffer
  const prices = products.map((p) => Number(p.price)).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description || `${category.name} para moto en Sequoia Speed`,
    url: `${baseUrl}/categoria/${category.slug}`,
    numberOfItems: total,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${baseUrl}/producto/${p.slug}`,
        name: p.name,
        image: p.images[0]?.url ? `${baseUrl}${p.images[0].url}` : undefined,
      })),
    },
    offers: prices.length > 0 ? {
      "@type": "AggregateOffer",
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: "COP",
      offerCount: total,
    } : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      {categoryFaqs[slug] && categoryFaqs[slug].length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: categoryFaqs[slug].map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }}
        />
      )}
      <CategoryTracker
        listName={category.name}
        listId={slug}
        items={products.map((p, i) => ({
          item_id: p.id,
          item_name: p.name,
          item_category: category.name,
          price: Number(p.price),
          quantity: 1,
          index: i,
        }))}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-white">Inicio</Link>
        <span>/</span>
        <span className="text-white">{category.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar subcategorías */}
        {category.children.length > 0 && (
          <aside className="md:w-56 flex-shrink-0">
            <h3 className="font-heading text-xl mb-4">SUBCATEGORÍAS</h3>
            <ul className="space-y-2">
              {category.children.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/categoria/${sub.slug}`}
                    className="text-sm text-neutral-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-4xl md:text-5xl animate-[fade-in_0.5s_ease-out]">
              {category.name.toUpperCase()}
            </h1>
            <span className="text-sm text-neutral-400">
              {total} producto{total !== 1 ? "s" : ""}
            </span>
          </div>

          {category.description && (
            <p className="text-neutral-400 mb-8 max-w-2xl">
              {category.description}
            </p>
          )}

          {products.length === 0 ? (
            <p className="text-neutral-400 py-12 text-center">
              No hay productos en esta categoría.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.price)}
                  compareAtPrice={
                    p.compareAtPrice ? Number(p.compareAtPrice) : null
                  }
                  image={p.images[0]?.url || "/products/placeholder.jpg"}
                  category={p.category.name}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/categoria/${slug}?page=${p}`}
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm ${
                    p === page
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:scale-110 transition-all duration-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}

          {/* Related Categories - Internal Linking */}
          {relatedCategories[slug] && relatedCategories[slug].length > 0 && (
            <section className="mt-12 border-t border-neutral-800 pt-10">
              <h2 className="font-heading text-xl mb-4">
                CATEGORÍAS RELACIONADAS
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedCategories[slug].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    className="bg-neutral-900 border border-neutral-700 hover:border-primary text-sm px-4 py-2 rounded-lg transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Blog Posts - Internal Linking */}
          {relatedBlogPosts[slug] && relatedBlogPosts[slug].length > 0 && (
            <section className="mt-8">
              <h2 className="font-heading text-xl mb-4">
                ARTÍCULOS RELACIONADOS
              </h2>
              <div className="grid gap-3">
                {relatedBlogPosts[slug].map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="bg-neutral-900 border border-neutral-800 hover:border-primary/50 rounded-lg p-4 transition group"
                  >
                    <span className="text-sm group-hover:text-primary transition">
                      {post.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
