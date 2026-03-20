import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/ProductDetail";
import { JsonLd } from "@/components/JsonLd";
import { productCROConfig } from "@/lib/product-cro-config";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}


/* ── Cross-sell category mapping ───────────────────── */
const complementaryCategories: Record<string, string[]> = {
  chaquetas: ["guantes-para-moto-impermeables-cuero-o-tela-bogota", "impermeables", "pantalones"],
  impermeables: ["botas", "guantes-para-moto-impermeables-cuero-o-tela-bogota", "chaquetas"],
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": ["chaquetas", "impermeables", "cascos"],
  pantalones: ["chaquetas", "botas", "guantes-para-moto-impermeables-cuero-o-tela-bogota"],
  botas: ["impermeables", "guantes-para-moto-impermeables-cuero-o-tela-bogota", "chaquetas"],
  "trajes-para-moto-antifriccion": ["guantes-para-moto-impermeables-cuero-o-tela-bogota", "botas", "cascos"],
  cascos: ["guantes-para-moto-impermeables-cuero-o-tela-bogota", "chaquetas", "impermeables"],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { where: { isCover: true }, take: 1 }, category: true },
  });
  if (!product) return {};

  const title = product.metaTitle || product.name;
  const rawDesc = product.metaDescription || product.shortDescription || product.description || "";
  const priceFormatted = new Intl.NumberFormat("es-CO").format(Number(product.price));
  const baseDesc = rawDesc
    ? stripHtml(rawDesc).substring(0, 120)
    : `${product.name}. Protección certificada CE para motociclistas`;
  const description = `${baseDesc} | Desde $${priceFormatted} COP · Envío Colombia · Pago contraentrega`;

  // noindex placeholder/non-product pages
  const noIndexSlugs = ["reserva-de-producto"];

  return {
    title,
    description,
    ...(noIndexSlugs.includes(slug) ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: `/producto/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://sequoiaspeed.com.co/producto/${slug}`,
      images: product.images[0]?.url
        ? [{ url: product.images[0].url, width: 800, height: 800, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
    other: {
      "product:price:amount": String(Number(product.price)),
      "product:price:currency": "COP",
      "product:availability": "in stock",
      "product:brand": "Sequoia Speed",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true } },
      category: true,
    },
  });

  if (!product || !product.isActive) notFound();

  // Related products (same category)
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: { where: { isCover: true }, take: 1 }, category: true },
    take: 4,
  });

  // Cross-sell products (complementary categories)
  const complementarySlugs = complementaryCategories[product.category.slug] || [];
  let crossSellProducts: typeof relatedProducts = [];

  if (complementarySlugs.length > 0) {
    crossSellProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        category: { slug: { in: complementarySlugs } },
      },
      include: { images: { where: { isCover: true }, take: 1 }, category: true },
      take: 4,
    });

    // Fallback: if no featured products in complementary categories, get any
    if (crossSellProducts.length < 4) {
      const moreProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          category: { slug: { in: complementarySlugs } },
          id: { notIn: crossSellProducts.map((p) => p.id) },
        },
        include: { images: { where: { isCover: true }, take: 1 }, category: true },
        take: 4 - crossSellProducts.length,
      });
      crossSellProducts = [...crossSellProducts, ...moreProducts];
    }
  }

  const baseUrl = "https://sequoiaspeed.com.co";
  const productUrl = `${baseUrl}/producto/${product.slug}`;
  const price = Number(product.price);

  const offers =
    product.variants.length > 0
      ? product.variants.map((v) => ({
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "COP",
          price: price + Number(v.priceModifier),
          name: v.name,
          sku: v.sku || undefined,
          availability:
            v.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "Sequoia Speed" },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "CO" },
            deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" } },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "CO",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 30,
            returnMethod: "https://schema.org/ReturnByMail",
          },
        }))
      : [
          {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "COP",
            price,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "Sequoia Speed" },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "CO" },
              deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" } },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "CO",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
            },
          },
        ];

  // Parse reviews for structured data
  const reviews = product.reviews as {name: string; city: string; rating: number; text: string}[] | null;
  const validReviews = reviews?.filter(r => r.rating && r.text) || [];
  const avgRating = validReviews.length > 0
    ? Math.round((validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length) * 10) / 10
    : null;

  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripHtml(product.description || product.shortDescription || ""),
    image: product.images.map((img) => `${baseUrl}${img.url}`),
    sku: product.reference || undefined,
    brand: { "@type": "Brand", name: "Sequoia Speed" },
    offers,
    ...(avgRating && validReviews.length > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        bestRating: 5,
        worstRating: 1,
        reviewCount: validReviews.length,
      },
      review: validReviews.map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.text,
      })),
    } : {}),
  };

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
        name: product.category.name,
        item: `${baseUrl}/categoria/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  // Published Q&A questions for this product
  const publishedQuestions = await prisma.productQuestion.findMany({
    where: { productId: product.id, isPublished: true },
    orderBy: [{ helpfulYes: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      authorName: true,
      question: true,
      answer: true,
      answeredAt: true,
      helpfulYes: true,
      helpfulNo: true,
      createdAt: true,
    },
  });

  const formatProduct = (p: typeof relatedProducts[0]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image: p.images[0]?.url || "/products/placeholder.jpg",
    category: p.category.name,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {publishedQuestions.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: publishedQuestions
              .filter((q) => q.answer)
              .map((q) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: q.answer,
                },
              })),
          }}
        />
      )}

      <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-white transition">
          Inicio
        </Link>
        <span className="text-neutral-600">/</span>
        <Link
          href={`/categoria/${product.category.slug}`}
          className="hover:text-white transition"
        >
          {product.category.name}
        </Link>
        <span className="text-neutral-600">/</span>
        <span className="text-white truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          reference: product.reference,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt || product.name,
            isCover: img.isCover,
          })),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            priceModifier: Number(v.priceModifier),
            stock: v.stock,
          })),
          categoryName: product.category.name,
          categorySlug: product.category.slug,
          subtitle: product.subtitle || "",
          benefits: product.benefits as {icon: string; text: string}[] | null,
          reviews: product.reviews as {name: string; city: string; rating: number; text: string}[] | null,
          faq: product.faq as {q: string; a: string}[] | null,
          targetAudience: productCROConfig[product.slug]?.targetAudience || null,
          salesCount: productCROConfig[product.slug]?.salesCount || null,
          humanDescription: productCROConfig[product.slug]?.humanDescription || null,
          crashProtection: productCROConfig[product.slug]?.crashProtection || null,
          comparisonTable: productCROConfig[product.slug]?.comparisonTable || null,
        }}
        questions={publishedQuestions.map(q => ({
          ...q,
          answeredAt: q.answeredAt?.toISOString() || null,
          createdAt: q.createdAt.toISOString(),
        }))}
        relatedProducts={relatedProducts.map(formatProduct)}
        crossSellProducts={crossSellProducts.map(formatProduct)}
      />
    </div>
  );
}
