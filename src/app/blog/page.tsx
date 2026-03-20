import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Blog — Guías y Consejos para Motociclistas",
  description:
    "Blog de Sequoia Speed: guías de equipamiento, normativa colombiana, seguridad vial y consejos expertos para motociclistas. Contenido actualizado.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Sequoia Speed",
    description: "Guías, normativa y consejos expertos para motociclistas en Colombia.",
    type: "website",
    url: "https://sequoiaspeed.com.co/blog",
  },
};

export default function BlogPage() {
  const baseUrl = "https://sequoiaspeed.com.co";

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Sequoia Speed",
    description: "Guías de equipamiento, normativa y seguridad vial para motociclistas en Colombia.",
    url: `${baseUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Sequoia Speed",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.date,
      author: { "@type": "Organization", name: "Sequoia Speed" },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <JsonLd data={blogSchema} />
      <JsonLd data={breadcrumbSchema} />

      <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
        <Link href="/" className="hover:text-white transition">Inicio</Link>
        <span className="text-neutral-600">/</span>
        <span className="text-white">Blog</span>
      </nav>

      <header className="mb-12">
        <h1 className="font-heading text-5xl md:text-6xl mb-4">BLOG</h1>
        <p className="text-xl text-neutral-300 max-w-2xl">
          Guías de equipamiento, normativa colombiana y consejos de seguridad
          vial para motociclistas.
        </p>
      </header>

      <div className="grid gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-primary/50 transition group"
          >
            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">
                {post.category}
              </span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{post.readTime} lectura</span>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="font-heading text-2xl mb-2 group-hover:text-primary transition">
                {post.title}
              </h2>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              {post.excerpt}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-primary text-sm font-medium hover:underline"
            >
              Leer artículo →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
