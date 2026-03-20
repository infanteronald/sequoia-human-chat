import Link from "next/link";

const footerCategories = [
  { label: "Chaquetas", slug: "chaquetas" },
  { label: "Impermeables", slug: "impermeables" },
  { label: "Guantes", slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota" },
  { label: "Cascos", slug: "cascos" },
  { label: "Pantalones", slug: "pantalones" },
  { label: "Trajes", slug: "trajes-para-moto-antifriccion" },
  { label: "Botas", slug: "botas" },
  { label: "Indumentaria", slug: "dotaciones-mensajeros-motorizados" },
];

export function Footer() {
  return (
    <>
      <footer className="bg-neutral-900 border-t border-neutral-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <img src="/logo-sequoia.webp" alt="Sequoia Speed" width={144} height={48} className="h-12 w-auto mb-4" />
              <p className="text-sm text-neutral-400">
                Indumentaria y accesorios premium para motociclistas.
                Protección certificada con estilo desde 2020.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Categorías</h4>
              <ul className="space-y-2">
                {footerCategories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/categoria/${cat.slug}`}
                      className="text-sm text-neutral-400 hover:text-white transition"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Mi Cuenta</h4>
              <ul className="space-y-2">
                {[
                  { label: "Iniciar Sesión", href: "/login" },
                  { label: "Registrarse", href: "/registro" },
                  { label: "Mi Cuenta", href: "/mi-cuenta" },
                  { label: "Mis Pedidos", href: "/mi-cuenta/pedidos" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Blog</h4>
              <ul className="space-y-2">
                {[
                  { label: "¿Qué es un Traje Antifricción?", href: "https://www.moto-dotaciones.com/blog/que-es-traje-antifriccion.html" },
                  { label: "Guía de Compra: Traje Antifricción", href: "https://www.moto-dotaciones.com/blog/guia-compra-traje-antifriccion.html" },
                  { label: "Normativa EPP Motociclistas", href: "https://www.moto-dotaciones.com/blog/normativa-epp-motociclistas-colombia.html" },
                  { label: "Protecciones CE-1621 Explicación", href: "https://www.moto-dotaciones.com/blog/protecciones-ce-1621-explicacion.html" },
                  { label: "Dotaciones para Empresas", href: "https://www.moto-dotaciones.com/dotacion-motorizados-empresa.html" },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <a href="https://wa.me/573247892412" className="hover:text-white transition flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp: +57 324 789 2412
                  </a>
                </li>
                <li>
                  <a href="mailto:ventas@sequoiaspeed.com.co" className="hover:text-white transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    ventas@sequoiaspeed.com.co
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Calle 80 #24-32, Polo Club, Bogotá
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a href="https://www.instagram.com/sequoiaspeed.co/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/sequoiaspeed.co/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-xs text-neutral-500">
            <p>&copy; {new Date().getFullYear()} Sequoia Speed. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/573247892412?text=Hola%2C%20me%20interesa%20conocer%20sus%20productos"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatea por WhatsApp"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <span className="absolute -top-12 right-0 bg-white text-neutral-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          ¿Necesitas ayuda?
        </span>
        <span className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 hover:shadow-green-500/50 hover:scale-110 transition-all duration-300">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </span>
        {/* Pulse animation */}
        <span className="absolute inset-0 w-14 h-14 bg-green-500 rounded-full animate-ping opacity-20" />
      </a>
    </>
  );
}
