import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { JsonLd } from "@/components/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: `https://sequoiaspeed.com.co/blog/${slug}`,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function renderMarkdown(content: string) {
  // Simple markdown to JSX — headings, paragraphs, bold, lists
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-neutral-300 mb-6 ml-4">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: parseBold(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const parseBold = (text: string) =>
    text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white"></strong>');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="font-heading text-2xl mt-10 mb-4">
          {trimmed.replace("## ", "")}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="font-heading text-xl mt-8 mb-3 text-primary">
          {trimmed.replace("### ", "")}
        </h3>
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.replace("- ", ""));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
    } else {
      flushList();
      elements.push(
        <p
          key={key++}
          className="text-neutral-300 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: parseBold(trimmed) }}
        />
      );
    }
  }
  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const baseUrl = "https://sequoiaspeed.com.co";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Sequoia Speed",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Sequoia Speed",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${baseUrl}/blog/${post.slug}` },
    ],
  };

  // Related blog posts (exclude current)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-white transition">Inicio</Link>
        <span className="text-neutral-600">/</span>
        <Link href="/blog" className="hover:text-white transition">Blog</Link>
        <span className="text-neutral-600">/</span>
        <span className="text-white truncate max-w-[250px]">{post.title}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
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
        <h1 className="font-heading text-4xl md:text-5xl leading-tight">
          {post.title}
        </h1>
      </header>

      <article className="prose-invert">
        {renderMarkdown(post.content)}
      </article>

      {/* Related categories CTA */}
      {post.relatedCategories.length > 0 && (
        <section className="mt-16 pt-8 border-t border-neutral-800">
          <h2 className="font-heading text-2xl mb-4">PRODUCTOS RELACIONADOS</h2>
          <div className="flex flex-wrap gap-3">
            {post.relatedCategories.map((catSlug) => (
              <Link
                key={catSlug}
                href={`/categoria/${catSlug}`}
                className="bg-neutral-900 border border-neutral-700 hover:border-primary text-sm px-4 py-2 rounded-lg transition"
              >
                {catSlug
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
                  .replace("Para Moto Impermeables Cuero O Tela Bogota", "para Moto")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-800">
          <h2 className="font-heading text-2xl mb-6">TAMBIÉN TE PUEDE INTERESAR</h2>
          <div className="grid gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="bg-neutral-900 border border-neutral-800 hover:border-primary/50 rounded-lg p-4 transition group"
              >
                <h3 className="font-medium group-hover:text-primary transition">
                  {rp.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{rp.readTime} lectura</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-12 bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
        <h2 className="font-heading text-2xl mb-3">¿NECESITAS ASESORÍA?</h2>
        <p className="text-neutral-400 text-sm mb-4">
          Escríbenos por WhatsApp y te ayudamos a elegir el equipamiento perfecto.
        </p>
        <a
          href="https://wa.me/573247892412?text=Hola%2C%20le%C3%AD%20un%20art%C3%ADculo%20del%20blog%20y%20tengo%20una%20pregunta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-green-500 text-green-500 hover:bg-green-500/10 px-6 py-2 rounded-lg font-medium transition"
        >
          WhatsApp
        </a>
      </section>
    </div>
  );
}
