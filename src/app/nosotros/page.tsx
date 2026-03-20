import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Nosotros — Quiénes Somos",
  description:
    "Sequoia Speed es la tienda especializada en equipamiento y protección para motociclistas en Colombia. Más de 5 años equipando a miles de motociclistas con productos de calidad certificada.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros — Sequoia Speed",
    description:
      "Conoce la historia, misión y equipo detrás de Sequoia Speed. Equipamiento profesional para motociclistas en Colombia.",
    type: "website",
    url: "https://sequoiaspeed.com.co/nosotros",
  },
};

export default function NosotrosPage() {
  const baseUrl = "https://sequoiaspeed.com.co";

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre Sequoia Speed",
    description:
      "Sequoia Speed es la tienda líder en equipamiento y protección para motociclistas en Colombia.",
    url: `${baseUrl}/nosotros`,
    mainEntity: {
      "@type": "Organization",
      name: "Sequoia Speed",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      foundingDate: "2019",
      foundingLocation: {
        "@type": "Place",
        name: "Bogotá, Colombia",
      },
      description:
        "Tienda especializada en equipamiento de protección para motociclistas. Chaquetas, guantes, botas, cascos e impermeables con certificación CE y envío a toda Colombia.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bogotá",
        addressLocality: "Bogotá",
        addressRegion: "Cundinamarca",
        addressCountry: "CO",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+57-324-789-2412",
        contactType: "customer service",
        availableLanguage: "Spanish",
      },
      sameAs: [
        "https://www.instagram.com/sequoiaspeed",
        "https://www.facebook.com/sequoiaspeed",
        "https://twitter.com/SequoiaSpeed",
        "https://www.youtube.com/channel/UCOJLfvLewklDUPHWlNbsvZA",
        "https://www.moto-dotaciones.com",
      ],
      knowsAbout: [
        "Equipamiento para motociclistas",
        "Protección personal para motocicletas",
        "Dotaciones para mensajeros motorizados",
        "Normativa de seguridad vial colombiana",
        "Certificaciones CE para protecciones de moto",
      ],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Nosotros",
        item: `${baseUrl}/nosotros`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Sequoia Speed tiene tienda física?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Operamos principalmente online con envío a toda Colombia. Esto nos permite ofrecer mejores precios al reducir costos operativos de local físico. Puedes visitarnos con cita previa en nuestra bodega en Bogotá.",
        },
      },
      {
        "@type": "Question",
        name: "¿Los productos de Sequoia Speed tienen garantía?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, todos nuestros productos tienen garantía contra defectos de fabricación. Las protecciones con certificación CE cumplen con estándares europeos de seguridad. Contáctanos si tienes algún inconveniente.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen envíos a toda Colombia?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, realizamos envíos a todas las ciudades y municipios de Colombia a través de transportadoras confiables. El tiempo de entrega es de 1-3 días hábiles en ciudades principales y 3-5 días en municipios.",
        },
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <JsonLd data={aboutSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
        <Link href="/" className="hover:text-white transition">
          Inicio
        </Link>
        <span className="text-neutral-600">/</span>
        <span className="text-white">Nosotros</span>
      </nav>

      {/* Hero */}
      <header className="mb-16 text-center">
        <h1 className="font-heading text-5xl md:text-6xl mb-4">
          SEQUOIA SPEED
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Equipamiento profesional para motociclistas en Colombia. Protección
          certificada, precios justos y envío a todo el país.
        </p>
      </header>

      {/* Nuestra Historia — E-E-A-T: Experience */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl mb-6">NUESTRA HISTORIA</h2>
        <div className="space-y-4 text-neutral-300 leading-relaxed">
          <p>
            Sequoia Speed nació en 2019 de la pasión de un grupo de motociclistas
            bogotanos que estaban cansados de la falta de opciones de equipamiento
            de calidad a precios accesibles en Colombia. Después de años
            comprando equipos importados a precios inflados, decidimos crear una
            alternativa.
          </p>
          <p>
            Empezamos con un catálogo pequeño de chaquetas y guantes, probando
            cada producto personalmente en las calles de Bogotá, la Ruta del Sol
            y las carreteras de Boyacá. Esa experiencia directa como
            motociclistas nos permite entender exactamente qué necesita cada
            conductor: desde el mensajero que recorre 100 km diarios hasta el
            aventurero de fin de semana.
          </p>
          <p>
            Hoy equipamos a miles de motociclistas en toda Colombia con un
            catálogo completo que incluye chaquetas, guantes, botas, cascos,
            impermeables, trajes antifricción, protecciones y dotaciones
            empresariales para flotas de mensajeros.
          </p>
        </div>
      </section>

      {/* Expertise — E-E-A-T: Expertise */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl mb-6">
          NUESTRA EXPERIENCIA Y CONOCIMIENTO
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-heading text-xl text-primary mb-3">
              SELECCIÓN EXPERTA DE PRODUCTOS
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Cada producto en nuestro catálogo pasa por un proceso de selección
              riguroso. Evaluamos materiales, costuras, protecciones,
              certificaciones y durabilidad antes de ofrecerlo. Conocemos las
              normas CE EN 1621 para protecciones y CE EN 17092 para prendas
              de protección contra abrasión.
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-heading text-xl text-primary mb-3">
              ASESORÍA PERSONALIZADA
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Nuestro equipo está formado por motociclistas activos que conocen
              cada producto de primera mano. Ofrecemos asesoría gratuita por
              WhatsApp para ayudarte a elegir la talla, modelo y nivel de
              protección ideal según tu tipo de conducción y presupuesto.
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-heading text-xl text-primary mb-3">
              DOTACIONES EMPRESARIALES
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Proveemos dotaciones completas para empresas con flotas de
              mensajeros motorizados. Cumplimos con la normativa colombiana
              del Código Sustantivo del Trabajo sobre dotación de empleados y
              las resoluciones de seguridad vial.
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-heading text-xl text-primary mb-3">
              SEGURIDAD VIAL
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Promovemos activamente la seguridad vial en Colombia. Conocemos
              la Resolución 1080 de 2019 sobre cascos, el Plan Nacional de
              Seguridad Vial y las mejores prácticas internacionales de
              protección para motociclistas.
            </p>
          </div>
        </div>
      </section>

      {/* Valores — E-E-A-T: Trust */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl mb-6">NUESTROS VALORES</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Seguridad Primero",
              desc: "No vendemos productos que no usaríamos nosotros mismos. La protección del motociclista es nuestra prioridad absoluta.",
              icon: "🛡️",
            },
            {
              title: "Precios Justos",
              desc: "Operamos online para trasladar el ahorro al cliente. Equipamiento de calidad no tiene que ser inalcanzable.",
              icon: "💰",
            },
            {
              title: "Transparencia",
              desc: "Descripción honesta de cada producto. Especificaciones reales, fotos reales, reseñas verificadas de clientes reales.",
              icon: "✅",
            },
          ].map((valor) => (
            <div key={valor.title} className="text-center">
              <span className="text-4xl block mb-3">{valor.icon}</span>
              <h3 className="font-heading text-lg mb-2">{valor.title}</h3>
              <p className="text-sm text-neutral-400">{valor.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cifras — E-E-A-T: Authority */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl mb-6">SEQUOIA SPEED EN CIFRAS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "+5", label: "Años de experiencia" },
            { number: "+3,000", label: "Motociclistas equipados" },
            { number: "32", label: "Ciudades de Colombia" },
            { number: "4.8★", label: "Calificación promedio" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center"
            >
              <span className="font-heading text-3xl text-primary block">
                {stat.number}
              </span>
              <span className="text-xs text-neutral-400 mt-1 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ visible */}
      <section className="mb-16">
        <h2 className="font-heading text-3xl mb-6">PREGUNTAS FRECUENTES</h2>
        <div className="space-y-4 max-w-3xl">
          {[
            {
              q: "¿Sequoia Speed tiene tienda física?",
              a: "Operamos principalmente online con envío a toda Colombia. Esto nos permite ofrecer mejores precios al reducir costos operativos de local físico. Puedes visitarnos con cita previa en nuestra bodega en Bogotá.",
            },
            {
              q: "¿Los productos de Sequoia Speed tienen garantía?",
              a: "Sí, todos nuestros productos tienen garantía contra defectos de fabricación. Las protecciones con certificación CE cumplen con estándares europeos de seguridad. Contáctanos si tienes algún inconveniente.",
            },
            {
              q: "¿Hacen envíos a toda Colombia?",
              a: "Sí, realizamos envíos a todas las ciudades y municipios de Colombia a través de transportadoras confiables. El tiempo de entrega es de 1-3 días hábiles en ciudades principales y 3-5 días en municipios.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group bg-neutral-900 rounded-lg border border-neutral-800"
            >
              <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium text-white hover:text-primary transition">
                {faq.q}
                <span className="ml-4 text-neutral-500 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-400 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-neutral-900 border border-neutral-800 rounded-2xl p-10">
        <h2 className="font-heading text-3xl mb-4">
          ¿LISTO PARA EQUIPARTE?
        </h2>
        <p className="text-neutral-400 mb-6 max-w-lg mx-auto">
          Explora nuestro catálogo completo o escríbenos por WhatsApp para
          asesoría personalizada y gratuita.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Ver Catálogo
          </Link>
          <a
            href="https://wa.me/573247892412?text=Hola%2C%20quiero%20asesor%C3%ADa%20sobre%20equipamiento%20para%20moto"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-green-500 text-green-500 hover:bg-green-500/10 px-8 py-3 rounded-lg font-medium transition"
          >
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
