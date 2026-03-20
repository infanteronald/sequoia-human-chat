import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { HeroVideo } from "@/components/HeroVideo";
import { ProductCarousel } from "@/components/ProductCarousel";
import { HomeAnimations } from "@/components/HomeAnimations";
import { CategoryTracker } from "@/components/CategoryTracker";

/* ── Category tiles config ─────────────────────────── */
const categoryTiles = [
  { name: "Chaquetas", slug: "chaquetas", image: "/products/4884-large_default.jpg" },
  { name: "Impermeables", slug: "impermeables", image: "/products/4110-large_default.jpg" },
  { name: "Pantalones", slug: "pantalones", image: "/products/794-large_default.jpg" },
  { name: "Guantes", slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", image: "/products/4548-large_default.jpg" },
  { name: "Trajes", slug: "trajes-para-moto-antifriccion", image: "/products/4645-large_default.jpg" },
  { name: "Botas", slug: "botas", image: "/products/5132-large_default.jpg" },
];

export default async function HomePage() {
  const [featuredProducts, latestProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { where: { isCover: true }, take: 1 }, category: true },
      take: 12,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: { where: { isCover: true }, take: 1 }, category: true },
      take: 12,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const baseUrl = "https://sequoiaspeed.com.co";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Productos Destacados",
    numberOfItems: featuredProducts.length,
    itemListElement: featuredProducts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/producto/${p.slug}`,
      name: p.name,
      image: p.images[0]?.url ? `${baseUrl}${p.images[0].url}` : undefined,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <CategoryTracker
        listName="Productos Destacados"
        listId="featured"
        items={featuredProducts.map((p, i) => ({
          item_id: p.id,
          item_name: p.name,
          item_category: p.category?.name || "",
          price: Number(p.price),
          quantity: 1,
          index: i,
        }))}
      />

      {/* ═══════ HERO — Full-screen video ═══════ */}
      <HeroVideo />

      {/* ═══════ USP TRUST STRIP ═══════ */}
      <section className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              ),
              title: "Envío nacional",
              desc: "A toda Colombia",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: "Protecciones CE",
              desc: "Certificadas removibles",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              title: "Cambios gratis",
              desc: "Primeros 15 días",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Pago contra entrega",
              desc: "O paga en línea",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-default">
              <div className="text-primary flex-shrink-0 trust-icon-glow transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CATEGORÍAS — Lifestyle tiles ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl">INDUMENTARIA PARA MOTO EN COLOMBIA</h1>
          <p className="text-neutral-400 mt-2">Protección premium para cada estilo de conducción</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categoryTiles.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className={`group relative overflow-hidden rounded-xl shadow-lg shadow-black/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 ${
                i < 2 ? "aspect-[4/5] md:aspect-[3/4]" : "aspect-square"
              }`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-transform duration-500 group-hover:translate-y-[-4px]">
                <h3 className="font-heading text-xl md:text-2xl text-white">{cat.name.toUpperCase()}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-300 mt-1 group-hover:text-primary transition-colors duration-300">
                  Explorar
                  <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ PRODUCTOS DESTACADOS ═══════ */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-heading text-4xl md:text-5xl">DESTACADOS</h2>
                <p className="text-neutral-400 mt-2">Los favoritos de nuestros clientes</p>
              </div>
              <Link href="/buscar?featured=1" className="text-primary text-sm hover:underline hidden md:block transition-colors duration-200 hover:text-primary-dark">
                Ver todos →
              </Link>
            </div>
          </div>
          <ProductCarousel
            products={featuredProducts.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: Number(p.price),
              compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
              image: p.images[0]?.url || "/products/placeholder.jpg",
              category: p.category.name,
            }))}
          />
          <div className="text-center mt-6 md:hidden">
            <Link href="/buscar?featured=1" className="text-primary text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
        </section>
      )}

      {/* ═══════ MID-PAGE EDITORIAL BANNER ═══════ */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/categories/cat-accion.jpg"
          alt="Protección en cada aventura"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-lg">
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">
                Tecnología de protección
              </p>
              <h2 className="font-heading text-4xl md:text-6xl text-white leading-none mb-4">
                IMPERMEABILIDAD
                <br />
                <span className="text-primary">REAL</span>
              </h2>
              <p className="text-neutral-300 mb-6 text-base md:text-lg">
                Costuras selladas, membrana interna y material antifricción.
                Diseñado para el clima colombiano.
              </p>
              <Link
                href="/categoria/impermeables"
                className="btn-premium inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg text-sm uppercase tracking-wider"
              >
                Ver Impermeables
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ NUEVOS INGRESOS ═══════ */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl">NUEVOS INGRESOS</h2>
              <p className="text-neutral-400 mt-2">Lo último en protección y estilo</p>
            </div>
            <Link href="/buscar" className="text-primary text-sm hover:underline hidden md:block transition-colors duration-200 hover:text-primary-dark">
              Ver todos →
            </Link>
          </div>
        </div>
        <ProductCarousel
          products={latestProducts.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            image: p.images[0]?.url || "/products/placeholder.jpg",
            category: p.category.name,
          }))}
        />
        <div className="text-center mt-6 md:hidden">
          <Link href="/buscar" className="text-primary text-sm hover:underline">
            Ver todos →
          </Link>
        </div>
      </section>

      {/* ═══════ BRAND STORY STRIP ═══════ */}
      <section className="border-t border-b border-neutral-800 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Desde 2020</p>
              <h2 className="font-heading text-3xl md:text-5xl leading-tight mb-4">
                PROTECCIÓN CERTIFICADA
                <br />
                CON ESTILO COLOMBIANO
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                En Sequoia Speed diseñamos indumentaria para motociclistas que no comprometen
                seguridad por estilo. Cada prenda cuenta con protecciones CE removibles,
                impermeabilidad real con costuras selladas y material antifricción de alta resistencia.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="font-heading text-3xl text-primary">5+</p>
                  <p className="text-xs text-neutral-400 mt-1">Años de experiencia</p>
                </div>
                <div>
                  <p className="font-heading text-3xl text-primary">10K+</p>
                  <p className="text-xs text-neutral-400 mt-1">Riders protegidos</p>
                </div>
                <div>
                  <p className="font-heading text-3xl text-primary">CE</p>
                  <p className="text-xs text-neutral-400 mt-1">Protecciones certificadas</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-black/40 transition-transform duration-700 hover:scale-[1.02]">
              <Image
                src="/categories/cat-trajes.jpg"
                alt="Riders Sequoia Speed"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 rounded-2xl p-8 md:p-12 text-center transition-all duration-500 hover:border-neutral-600/50 hover:shadow-xl hover:shadow-primary/5">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">ÚNETE A LA COMUNIDAD</h2>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">
            Recibe ofertas exclusivas, lanzamientos anticipados y contenido para riders.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
            <button
              type="submit"
              className="btn-premium px-8 py-3 bg-primary text-white font-bold rounded-lg text-sm uppercase tracking-wider flex-shrink-0"
            >
              Suscribirse
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-3">Sin spam. Puedes darte de baja cuando quieras.</p>
        </div>
      </section>

      {/* ═══════ FINAL CTA BANNER ═══════ */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
            ¿NECESITAS AYUDA PARA ELEGIR?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Nuestros asesores te ayudan a encontrar la dotación perfecta para tu estilo de conducción
          </p>
          <a
            href="https://wa.me/573247892412?text=Hola%2C%20necesito%20asesor%C3%ADa%20para%20elegir%20mi%20dotaci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-lg transition-all duration-300 text-sm uppercase tracking-wider hover:scale-105 hover:shadow-2xl hover:shadow-black/30"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chatear con un asesor
          </a>
        </div>
      </section>

      {/* ═══════ CLIENT-SIDE ANIMATIONS ═══════ */}
      <HomeAnimations />
    </>
  );
}
