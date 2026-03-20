/**
 * Internal linking: categorías relacionadas y artículos del blog
 * Hub-and-spoke topology para SEO
 */
export const relatedCategories: Record<string, { slug: string; name: string }[]> = {
  chaquetas: [
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "protecciones", name: "Protecciones" },
    { slug: "pantalones", name: "Pantalones" },
    { slug: "impermeables", name: "Impermeables" },
  ],
  impermeables: [
    { slug: "botas", name: "Botas" },
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "chaquetas", name: "Chaquetas" },
  ],
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "impermeables", name: "Impermeables" },
    { slug: "cascos", name: "Cascos" },
  ],
  pantalones: [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "botas", name: "Botas" },
    { slug: "protecciones", name: "Protecciones" },
  ],
  botas: [
    { slug: "impermeables", name: "Impermeables" },
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "pantalones", name: "Pantalones" },
  ],
  "trajes-para-moto-antifriccion": [
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "botas", name: "Botas" },
    { slug: "cascos", name: "Cascos" },
    { slug: "protecciones", name: "Protecciones" },
  ],
  cascos: [
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "protecciones", name: "Protecciones" },
  ],
  protecciones: [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "pantalones", name: "Pantalones" },
    { slug: "cascos", name: "Cascos" },
  ],
  "dotaciones-mensajeros-motorizados": [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "impermeables", name: "Impermeables" },
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
    { slug: "botas", name: "Botas" },
  ],
  cortavientos: [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "cuellos", name: "Cuellos" },
    { slug: "impermeables", name: "Impermeables" },
  ],
  cuellos: [
    { slug: "cascos", name: "Cascos" },
    { slug: "cortavientos", name: "Cortavientos" },
    { slug: "chaquetas", name: "Chaquetas" },
  ],
  airbag: [
    { slug: "chaquetas", name: "Chaquetas" },
    { slug: "protecciones", name: "Protecciones" },
    { slug: "cascos", name: "Cascos" },
  ],
  accesorios: [
    { slug: "cascos", name: "Cascos" },
    { slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota", name: "Guantes para Moto" },
  ],
};

export const relatedBlogPosts: Record<string, { slug: string; title: string }[]> = {
  chaquetas: [
    { slug: "como-elegir-chaqueta-moto-guia-experta", title: "Cómo Elegir la Chaqueta de Moto Perfecta" },
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
  ],
  impermeables: [
    { slug: "proteccion-lluvia-moto-guia-impermeable", title: "Cómo Protegerte de la Lluvia en Moto" },
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
  ],
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": [
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
    { slug: "proteccion-lluvia-moto-guia-impermeable", title: "Cómo Protegerte de la Lluvia en Moto" },
  ],
  botas: [
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
    { slug: "proteccion-lluvia-moto-guia-impermeable", title: "Cómo Protegerte de la Lluvia en Moto" },
  ],
  cascos: [
    { slug: "seguridad-vial-motociclistas-colombia-guia", title: "Seguridad Vial para Motociclistas en Colombia" },
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
  ],
  protecciones: [
    { slug: "seguridad-vial-motociclistas-colombia-guia", title: "Seguridad Vial para Motociclistas en Colombia" },
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
  ],
  "dotaciones-mensajeros-motorizados": [
    { slug: "dotaciones-mensajeros-motorizados-normativa-colombia", title: "Dotaciones para Mensajeros: Normativa Colombia" },
    { slug: "seguridad-vial-motociclistas-colombia-guia", title: "Seguridad Vial para Motociclistas" },
  ],
  "trajes-para-moto-antifriccion": [
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
    { slug: "seguridad-vial-motociclistas-colombia-guia", title: "Seguridad Vial para Motociclistas" },
  ],
  pantalones: [
    { slug: "guia-completa-equipamiento-motociclista-colombia", title: "Guía Completa de Equipamiento para Moto" },
    { slug: "como-elegir-chaqueta-moto-guia-experta", title: "Cómo Elegir Chaqueta para Moto" },
  ],
};
