import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Sequoia Speed Colombia SAS. Información sobre recopilación, uso y protección de datos personales.",
  alternates: {
    canonical: "/privacidad",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-4xl mb-6">Política de Privacidad</h1>
      <p className="text-neutral-400 mb-8">
        <strong className="text-white">Sequoia Speed Colombia SAS</strong> — Última actualización: Marzo 2026
      </p>

      <div className="space-y-8 text-neutral-300 leading-relaxed">
        <section>
          <h2 className="font-heading text-2xl text-white mb-3">1. Información que recopilamos</h2>
          <p>
            Recopilamos información que usted nos proporciona directamente, como nombre, número de
            teléfono, correo electrónico, dirección de envío y mensajes enviados a través de WhatsApp
            o nuestro formulario de contacto para brindarle un mejor servicio de atención al cliente.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-white mb-3">2. Uso de la información</h2>
          <p>
            Utilizamos su información para responder a sus consultas, procesar pedidos, gestionar
            envíos, mejorar nuestros servicios y enviar comunicaciones relevantes sobre nuestros
            productos y promociones.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-white mb-3">3. Protección de datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información
            personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-white mb-3">4. Derechos del titular</h2>
          <p>
            De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a
            conocer, actualizar, rectificar y solicitar la supresión de sus datos personales.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-white mb-3">5. Contacto</h2>
          <p>
            Para preguntas sobre esta política o para ejercer sus derechos como titular de datos,
            contáctenos a través de nuestros canales de atención.
          </p>
        </section>
      </div>

      <p className="text-neutral-500 text-sm mt-12">
        © 2026 Sequoia Speed Colombia SAS. Todos los derechos reservados.
      </p>
    </div>
  );
}
