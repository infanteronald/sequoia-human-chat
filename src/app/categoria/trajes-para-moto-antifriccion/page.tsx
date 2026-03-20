import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Trajes Antifricción para Moto | Protección Certificada CE | Sequoia Speed",
  description:
    "Trajes antifricción para motociclistas de una y dos piezas. Material resistente a la abrasión con protecciones certificadas CE EN 1621-1 Level 2. Impermeables. Chaquetas y pantalones antifricción. Envío a toda Colombia.",
  keywords:
    "trajes antifricción moto, traje motociclista, traje protección moto, chaqueta antifricción, pantalón antifricción, traje moto dos piezas, protección motociclista, traje moto impermeable, ropa seguridad moto, equipo protección motociclista",
  alternates: { canonical: "/categoria/trajes-para-moto-antifriccion" },
  openGraph: {
    title: "Trajes Antifricción para Moto | Sequoia Speed",
    description:
      "Trajes antifricción con protecciones certificadas CE. Impermeables, resistentes a la abrasión. Para carretera, ciudad y circuito.",
    type: "website",
    url: "https://sequoiaspeed.com.co/categoria/trajes-para-moto-antifriccion",
    images: [{ url: "/logo.png", width: 800, height: 600, alt: "Trajes Antifricción Sequoia Speed" }],
  },
};

export const revalidate = 3600;

export default async function TrajesAntifriccionPage() {
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: [
          "trajes-para-moto-antifriccion",
          "chaquetas",
          "pantalones",
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
        name: "Trajes Antifricción para Moto",
        item: `${baseUrl}/categoria/trajes-para-moto-antifriccion`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué es un traje antifricción para moto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Un traje antifricción es una prenda diseñada con materiales resistentes a la abrasión que protege al motociclista en caso de caída o deslizamiento sobre el asfalto. Incluye protecciones certificadas CE en zonas críticas como hombros, codos, rodillas y espalda.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué certificación tienen las protecciones?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nuestras protecciones están certificadas bajo la norma europea CE EN 1621-1 Level 2, el estándar más alto de protección para motociclistas. Esto garantiza absorción de impacto superior en hombros, codos, rodillas y espalda.",
        },
      },
      {
        "@type": "Question",
        name: "¿Los trajes antifricción son impermeables?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Todos nuestros trajes antifricción incluyen membrana impermeable integrada o desmontable. Los modelos Carrera, TT, Black Pro, Sahara y Mesh ofrecen protección contra lluvia sin sacrificar transpirabilidad.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuál es la diferencia entre traje de una pieza y dos piezas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El traje de una pieza ofrece protección continua en la zona de la cintura y es ideal para uso en circuito. El traje de dos piezas (chaqueta + pantalón) es más versátil para uso diario, permite usar las prendas por separado y facilita la entrada a lugares como oficinas o restaurantes.",
        },
      },
      {
        "@type": "Question",
        name: "¿Ofrecen personalización para empresas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Personalizamos trajes antifricción con el logotipo de su empresa mediante bordado o estampado de alta calidad. Ideal para flotas de mensajeros, escoltas y motorizados corporativos. Descuentos por volumen disponibles.",
        },
      },
    ],
  };

  const grouped = categories.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  // Reorder: trajes first, then chaquetas, then pantalones
  const order = ["trajes-para-moto-antifriccion", "chaquetas", "pantalones"];
  grouped.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  return (
    <div className="bg-neutral-950 text-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-400 mb-8">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <span>/</span>
            <span className="text-primary">Trajes Antifricción</span>
          </nav>

          <h1 className="font-heading text-4xl md:text-6xl mb-6 text-primary">
            TRAJES ANTIFRICCIÓN PARA MOTOCICLISTAS
          </h1>

          <p className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto mb-6 leading-relaxed">
            Sequoia Speed lleva fabricando <strong className="text-white">protecciones para moto</strong> desde
            2015. Trajes antifricción de una y dos piezas con protecciones <strong className="text-white">certificadas
            CE EN 1621-1 Level 2</strong> para máxima seguridad en carretera, ciudad y circuito.
          </p>

          <p className="text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Chaquetas, pantalones, guantes, botas y cascos. Nuestros trajes están hechos en
            material resistente a la abrasión, con protectores en hombros, codos, rodillas y espalda
            que se ajustan perfectamente. <strong className="text-white">100% impermeables.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573108567183?text=Hola,%20me%20interesan%20los%20trajes%20antifricción%20para%20moto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.542-.804-6.275-2.152l-.438-.353-2.638.884.884-2.638-.353-.438A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Cotizar por WhatsApp
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

      {/* Características */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            ¿POR QUÉ ELEGIR UN TRAJE ANTIFRICCIÓN?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🛡️",
                title: "Protección CE Level 2",
                desc: "Protectores certificados CE EN 1621-1 Level 2 en hombros, codos, rodillas y espalda. El estándar más alto de protección contra impacto.",
              },
              {
                icon: "🔥",
                title: "Material Antifricción",
                desc: "Tejido de alta tenacidad resistente a la abrasión. En caso de caída, el material resiste el deslizamiento sobre asfalto protegiendo tu piel.",
              },
              {
                icon: "🌧️",
                title: "100% Impermeable",
                desc: "Membrana impermeable integrada que mantiene al motociclista seco sin comprometer la transpirabilidad. Ideal para clima colombiano.",
              },
              {
                icon: "🧲",
                title: "Protecciones Removibles",
                desc: "Protectores extraíbles que permiten usar la prenda como ropa casual. Fácil mantenimiento y posibilidad de upgrade a protecciones de mayor nivel.",
              },
              {
                icon: "✨",
                title: "Personalización con Logo",
                desc: "Bordamos o estampamos el logotipo de tu empresa. Ideal para flotas de mensajeros, escoltas y motorizados corporativos.",
              },
              {
                icon: "📦",
                title: "Envío a toda Colombia",
                desc: "Despachos a Bogotá en 1-2 días. Envíos nacionales a cualquier ciudad en 3-5 días hábiles. Pago contra entrega disponible.",
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

      {/* Modelos */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
            MODELOS DE TRAJES ANTIFRICCIÓN
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Cada modelo está diseñado para un estilo de conducción diferente. Todos incluyen protecciones certificadas CE y son impermeables.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "CARRERA",
                desc: "Nuestro modelo insignia. Diseño deportivo con líneas aerodinámicas. Disponible en Blue, Green y Red. Material premium antifricción con protecciones CE Level 2 y membrana impermeable integrada.",
                ideal: "Ideal para: conducción deportiva y carretera",
              },
              {
                name: "BLACK PRO",
                desc: "Diseño sobrio y profesional en negro. Perfecto para uso corporativo y diario. Material antifricción de alta resistencia con protecciones CE removibles. Disponible para hombre y dama.",
                ideal: "Ideal para: uso diario, corporativo y escoltas",
              },
              {
                name: "TT",
                desc: "Inspirado en el Tourist Trophy. Combina estilo racing con funcionalidad urbana. Protecciones certificadas CE removibles y membrana 100% impermeable.",
                ideal: "Ideal para: touring y viajes largos",
              },
              {
                name: "MESH",
                desc: "Diseñado para clima cálido. Malla transpirable de alta resistencia que mantiene ventilación sin sacrificar protección antifricción. Impermeable con membrana desmontable.",
                ideal: "Ideal para: clima cálido y ciudades tropicales",
              },
              {
                name: "SAHARA",
                desc: "Adventure y off-road. Diseño robusto para terrenos mixtos. Material extra resistente con protecciones CE Level 2. Completamente impermeable para cualquier condición.",
                ideal: "Ideal para: adventure y terrenos mixtos",
              },
              {
                name: "AVS",
                desc: "Máxima versatilidad. Sistema de ventilación avanzado con múltiples configuraciones. Protecciones CE integradas y diseño adaptable a cualquier clima y estilo de conducción.",
                ideal: "Ideal para: uso versátil todo clima",
              },
            ].map((model, i) => (
              <div
                key={i}
                className="border border-neutral-700 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <h3 className="font-heading text-2xl mb-3 text-primary">{model.name}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-3">{model.desc}</p>
                <p className="text-xs text-neutral-500 italic">{model.ideal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
            CATÁLOGO DE TRAJES Y CHAQUETAS ANTIFRICCIÓN
          </h2>
          <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Todos nuestros productos incluyen protecciones certificadas CE y son impermeables.
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
                {group.products.slice(0, 8).map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className="group bg-neutral-800 rounded-lg overflow-hidden hover:ring-1 hover:ring-primary/50 transition-all duration-300"
                  >
                    <div className="aspect-square relative bg-neutral-700">
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

      {/* Comparativa */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            ¿TRAJE DE UNA O DOS PIEZAS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
              <h3 className="font-heading text-2xl mb-4 text-primary">TRAJE COMPLETO</h3>
              <p className="text-sm text-neutral-400 mb-4">Chaqueta + pantalón integrados</p>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Protección continua en zona lumbar</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Ajuste perfecto como conjunto</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Ideal para circuito y carretera</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Mayor protección en caídas</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Aspecto profesional deportivo</li>
              </ul>
            </div>
            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
              <h3 className="font-heading text-2xl mb-4 text-primary">DOS PIEZAS</h3>
              <p className="text-sm text-neutral-400 mb-4">Chaqueta y pantalón por separado</p>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Versatilidad de uso diario</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Usa cada pieza por separado</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Fácil de poner y quitar</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Ideal para ciudad y commuting</li>
                <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Acceso cómodo a oficinas y locales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-neutral-900">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-12">
            PREGUNTAS FRECUENTES
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Qué es un traje antifricción para moto?",
                a: "Un traje antifricción es una prenda diseñada con materiales resistentes a la abrasión que protege al motociclista en caso de caída o deslizamiento sobre el asfalto. Incluye protecciones certificadas CE en zonas críticas como hombros, codos, rodillas y espalda.",
              },
              {
                q: "¿Qué certificación tienen las protecciones?",
                a: "Nuestras protecciones están certificadas bajo la norma europea CE EN 1621-1 Level 2, el estándar más alto de protección para motociclistas. Esto garantiza absorción de impacto superior en hombros, codos, rodillas y espalda.",
              },
              {
                q: "¿Los trajes antifricción son impermeables?",
                a: "Sí. Todos nuestros trajes antifricción incluyen membrana impermeable integrada o desmontable. Los modelos Carrera, TT, Black Pro, Sahara y Mesh ofrecen protección contra lluvia sin sacrificar transpirabilidad.",
              },
              {
                q: "¿Cuál es la diferencia entre traje de una pieza y dos piezas?",
                a: "El traje de una pieza ofrece protección continua en la zona de la cintura y es ideal para circuito. El de dos piezas (chaqueta + pantalón) es más versátil para uso diario, permite usar las prendas por separado.",
              },
              {
                q: "¿Ofrecen personalización para empresas?",
                a: "Sí. Personalizamos trajes antifricción con el logotipo de su empresa mediante bordado o estampado de alta calidad. Ideal para flotas de mensajeros, escoltas y motorizados corporativos.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition"
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
            PROTÉGETE CON LO MEJOR
          </h2>
          <p className="text-neutral-400 mb-8 text-lg">
            Más de 1.000 motociclistas confían en Sequoia Speed para su protección diaria.
            Contáctanos para asesoría personalizada.
          </p>
          <a
            href="https://wa.me/573108567183?text=Hola,%20me%20interesan%20los%20trajes%20antifricción"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/30"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.359 0-4.542-.804-6.275-2.152l-.438-.353-2.638.884.884-2.638-.353-.438A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Cotizar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
