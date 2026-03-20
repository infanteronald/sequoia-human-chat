import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Dotaciones para Mensajeros Motorizados y Escoltas | Trajes Antifricción Bogotá",
  description:
    "Trajes de dotación antifricción para mensajeros motorizados, escoltas y supervisores. Chaquetas, pantalones, botas y guantes con protecciones certificadas CE. Personalizados con logo de empresa. Envío a toda Colombia.",
  keywords:
    "dotaciones mensajeros motorizados, trajes antifricción dotación, uniformes para moto, ropa seguridad motorizado, chaquetas dotación mensajero, dotaciones motociclistas bogota, equipo protección motociclistas, traje motorizado empresa, uniformes escoltas moto, EPP motorizados",
  alternates: { canonical: "/categoria/dotaciones-mensajeros-motorizados" },
  openGraph: {
    title: "Dotaciones para Mensajeros Motorizados | Sequoia Speed",
    description:
      "Trajes de dotación antifricción para empresas. Chaquetas, pantalones, botas y guantes certificados CE. Personalización con logo.",
    type: "website",
    url: "https://sequoiaspeed.com.co/categoria/dotaciones-mensajeros-motorizados",
    images: [{ url: "/logo.png", width: 800, height: 600, alt: "Dotaciones Sequoia Speed" }],
  },
};

export const revalidate = 3600;

export default async function DotacionesPage() {
  // Fetch products from relevant categories for dotaciones
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          "chaquetas",
          "pantalones",
          "botas",
          "guantes-para-moto-impermeables-cuero-o-tela-bogota",
          "trajes-para-moto-antifriccion",
          "impermeables",
          "protecciones",
          "cascos",
        ],
      },
    },
    select: { id: true, name: true, slug: true },
  });

  const categoryIds = categories.map((c) => c.id);

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: categoryIds } },
    include: {
      images: { where: { isCover: true }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = "https://sequoiaspeed.com.co";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dotaciones para Mensajeros Motorizados",
        item: `${baseUrl}/categoria/dotaciones-mensajeros-motorizados`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué incluye una dotación para mensajero motorizado?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Una dotación completa incluye chaqueta antifricción con protecciones certificadas CE, pantalón con protectores de rodilla, guantes con refuerzo en nudillos, botas de protección y opcionalmente casco y traje impermeable. Todos pueden personalizarse con el logo de la empresa.",
        },
      },
      {
        "@type": "Question",
        name: "¿Las dotaciones cumplen con normativa SST en Colombia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Nuestras dotaciones cumplen con el Decreto 1072 de 2015 y la Resolución 0312 de 2019 del Sistema de Gestión de Seguridad y Salud en el Trabajo. Las protecciones están certificadas bajo norma CE EN 1621-1 Level 2.",
        },
      },
      {
        "@type": "Question",
        name: "¿Ofrecen personalización con logo de empresa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Realizamos bordados y estampados de alta calidad con el logotipo de su empresa. Trabajamos con flotas de mensajería, empresas de logística, escoltas y supervisores de seguridad en toda Colombia.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuál es el pedido mínimo para dotaciones empresariales?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No hay pedido mínimo. Atendemos desde 1 unidad hasta flotas completas de cientos de motorizados. Ofrecemos descuentos por volumen a partir de 10 unidades.",
        },
      },
    ],
  };

  // Group products by category
  const grouped = categories.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  return (
    <div className="bg-neutral-950 text-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-8">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <span>/</span>
            <span className="text-primary">Dotaciones</span>
          </nav>

          <h1 className="font-heading text-4xl md:text-6xl mb-6 text-primary">
            TRAJES DE DOTACIÓN ANTIFRICCIÓN PARA MENSAJEROS MOTORIZADOS
          </h1>

          <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            <strong className="text-white">Trajes de dotación antifricción en Bogotá</strong> para empresas que
            requieran dotación para mensajeros motorizados, trajes o uniformes para escoltas, uniformes
            para moto o chaquetas institucionales.
          </p>

          <p className="text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Nuestras <strong className="text-white">chaquetas de dotación antifricción</strong> son impermeables
            según su requerimiento, las cuales pueden ser personalizadas con el logotipo de su empresa.
            Envío a toda Colombia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573108567183?text=Hola,%20me%20interesa%20cotizar%20dotaciones%20para%20mensajeros%20motorizados"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.542-.804-6.275-2.152l-.438-.353-2.638.884.884-2.638-.353-.438A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Cotizar Dotaciones por WhatsApp
            </a>
            <a
              href="tel:+573108567183"
              className="inline-flex items-center justify-center gap-2 border border-neutral-600 hover:border-primary text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300"
            >
              📞 Llamar: 310 856 7183
            </a>
          </div>
        </div>
      </section>

      {/* Qué Incluye una Dotación */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            ¿QUÉ INCLUYE UNA DOTACIÓN COMPLETA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🧥",
                title: "Chaqueta Antifricción",
                desc: "Material resistente a la abrasión con protecciones certificadas CE EN 1621-1 en codos y espalda. Impermeable y personalizable con logo.",
              },
              {
                icon: "👖",
                title: "Pantalón con Protecciones",
                desc: "Protectores certificados en rodillas removibles. Material antifricción e impermeable. Ideal para uso diario en ruta.",
              },
              {
                icon: "🥾",
                title: "Botas de Protección",
                desc: "Botas tipo militar y de caucho impermeables para motorizados. Protección de tobillo y suela antideslizante.",
              },
              {
                icon: "🧤",
                title: "Guantes de Protección",
                desc: "Guantes con protección en nudillos, palma reforzada. Disponibles en cuero, textil e impermeables.",
              },
              {
                icon: "🌧️",
                title: "Traje Impermeable",
                desc: "Impermeables tipo sudadera con forro de silicona interna. Combos con zapatones y forro de morral.",
              },
              {
                icon: "⛑️",
                title: "Casco y Accesorios",
                desc: "Cascos certificados, rodilleras metálicas, chalecos airbag y accesorios complementarios para la flota.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-neutral-800 rounded-xl p-6 hover:bg-neutral-750 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-heading text-xl mb-3 text-primary">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos por Categoría */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
            PRODUCTOS PARA DOTACIÓN
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Seleccione los productos que necesita para equipar a sus mensajeros, escoltas o motorizados.
            Ofrecemos descuentos por volumen.
          </p>

          {grouped.map((group) => (
            <div key={group.id} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl text-primary">{group.name.toUpperCase()}</h3>
                <Link
                  href={`/categoria/${group.slug}`}
                  className="text-sm text-neutral-400 hover:text-primary transition"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {group.products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className="group bg-neutral-900 rounded-lg overflow-hidden hover:ring-1 hover:ring-primary/50 transition-all duration-300"
                  >
                    <div className="aspect-square relative bg-neutral-800">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-neutral-300 line-clamp-2 group-hover:text-white transition">
                        {product.name}
                      </p>
                      <p className="text-primary font-bold mt-1">
                        ${Number(product.price).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            DOTACIONES PARA TODOS LOS SECTORES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Empresas de Mensajería y Logística",
                desc: "Rappi, Didi, iFood, empresas de courier y logística de última milla. Uniformes resistentes para uso diario intensivo.",
              },
              {
                title: "Escoltas y Seguridad Privada",
                desc: "Trajes antifricción discretos y profesionales para escoltas motorizados. Protección máxima con apariencia institucional.",
              },
              {
                title: "Supervisores y Coordinadores",
                desc: "Dotaciones para supervisores de campo que recorren rutas en moto. Comodidad y protección en cada desplazamiento.",
              },
              {
                title: "Flotas Empresariales",
                desc: "Dotación completa para flotas de motorizados corporativos. Descuentos por volumen y personalización con marca.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-neutral-700 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <h3 className="font-heading text-xl mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            PREGUNTAS FRECUENTES
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Qué incluye una dotación para mensajero motorizado?",
                a: "Una dotación completa incluye chaqueta antifricción con protecciones certificadas CE, pantalón con protectores de rodilla, guantes con refuerzo en nudillos, botas de protección y opcionalmente casco y traje impermeable. Todos pueden personalizarse con el logo de la empresa.",
              },
              {
                q: "¿Las dotaciones cumplen con normativa SST en Colombia?",
                a: "Sí. Nuestras dotaciones cumplen con el Decreto 1072 de 2015 y la Resolución 0312 de 2019 del Sistema de Gestión de Seguridad y Salud en el Trabajo. Las protecciones están certificadas bajo norma CE EN 1621-1 Level 2.",
              },
              {
                q: "¿Ofrecen personalización con logo de empresa?",
                a: "Sí. Realizamos bordados y estampados de alta calidad con el logotipo de su empresa. Trabajamos con flotas de mensajería, empresas de logística, escoltas y supervisores de seguridad en toda Colombia.",
              },
              {
                q: "¿Cuál es el pedido mínimo para dotaciones empresariales?",
                a: "No hay pedido mínimo. Atendemos desde 1 unidad hasta flotas completas de cientos de motorizados. Ofrecemos descuentos por volumen a partir de 10 unidades.",
              },
              {
                q: "¿Hacen envíos a todo el país?",
                a: "Sí. Enviamos a todas las ciudades y departamentos de Colombia. Los envíos dentro de Bogotá se entregan en 1-2 días hábiles. Envíos nacionales en 3-5 días hábiles.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group bg-neutral-900 rounded-lg border border-neutral-800 hover:border-neutral-700 transition"
              >
                <summary className="cursor-pointer p-5 font-medium flex items-center justify-between">
                  {item.q}
                  <span className="text-primary ml-4 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="px-5 pb-5 text-neutral-400 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            COTICE SU DOTACIÓN HOY
          </h2>
          <p className="text-neutral-400 mb-8 text-lg">
            Más de 1.000 empresas confían en Sequoia Speed para la dotación de sus motorizados.
            Contáctenos para una cotización personalizada.
          </p>
          <a
            href="https://wa.me/573108567183?text=Hola,%20necesito%20cotizar%20dotaciones%20para%20mi%20empresa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/30"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.542-.804-6.275-2.152l-.438-.353-2.638.884.884-2.638-.353-.438A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Cotizar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
