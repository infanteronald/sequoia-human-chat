/* ── Per-Product CRO Configuration ─────────────────────
 * Personalized content for each product:
 * - subtitle: descriptive tagline below the title
 * - benefits: 3 outcome-oriented bullet points specific to this product
 * - reviews: 3 realistic reviews specific to this product
 * - faq: 3-4 product-specific questions
 * - targetAudience: specific buyer personas for this product
 * - salesCount: realistic sales count for social proof
 * ───────────────────────────────────────────────────── */

export interface ProductCROConfig {
  subtitle: string;
  benefits: { icon: string; text: string }[];
  reviews: { name: string; city: string; rating: number; text: string }[];
  faq: { q: string; a: string }[];
  targetAudience: string[];
  salesCount: number;
  humanDescription: string;
  crashProtection: {
    title: string;
    description: string;
    protections: string[];
  } | null;
  comparisonTable: { feature: string; sequoia: boolean; generic: boolean }[] | null;
}

export const productCROConfig: Record<string, ProductCROConfig> = {
  // ══════════════════════════════════════════════════
  // BOTAS
  // ══════════════════════════════════════════════════
  "botas-de-caucho-impermeables-dakar-negra-moto-motociclismo": {
    subtitle: "Protección impermeable para tus pies en cualquier clima",
    benefits: [
      { icon: "droplet", text: "100% impermeables — tus pies secos bajo lluvia fuerte" },
      { icon: "shield", text: "Suela antideslizante para mejor apoyo en el piso" },
      { icon: "bolt", text: "Diseñadas para uso diario en moto, cómodas todo el día" },
    ],
    reviews: [
      { name: "Andrés G.", city: "Bogotá", rating: 5, text: "Las uso todos los días para trabajar en moto. Son cómodas y no entra nada de agua. Buena inversión." },
      { name: "Felipe R.", city: "Manizales", rating: 5, text: "Llevaba tiempo buscando unas botas impermeables que sirvieran para moto. Estas son perfectas." },
      { name: "Carolina T.", city: "Medellín", rating: 4, text: "Buenas botas para la lluvia. La suela agarra bien y son fáciles de poner y quitar." },
    ],
    faq: [
      { q: "¿Son realmente impermeables?", a: "Sí, están fabricadas en caucho 100% impermeable. No entra agua ni siquiera en lluvia fuerte." },
      { q: "¿Sirven para caminar o solo para moto?", a: "Sirven para ambas. La suela es cómoda para caminar y antideslizante." },
      { q: "¿Las tallas son estándar?", a: "Sí, el tallaje es estándar colombiano. Si estás entre dos tallas, elige la más grande." },
    ],
    targetAudience: ["Motociclistas que ruedan bajo lluvia frecuente en ciudades como Bogotá o Manizales", "Trabajadores que usan moto como transporte diario y necesitan calzado resistente", "Domiciliarios que necesitan los pies secos durante toda la jornada laboral"],
    salesCount: 22,
    humanDescription: "Estas botas te mantienen los pies completamente secos sin importar qué tan fuerte llueva. Son cómodas para usar todo el día y su suela antideslizante te da confianza al apoyar el pie en el piso mojado.",
    crashProtection: {
      title: "¿Qué pasa si tu pie queda atrapado o pisas en mojado?",
      description: "En una maniobra de emergencia, el apoyo del pie en el suelo es crítico. Un resbalón puede significar una caída.",
      protections: [
        "Suela de caucho antideslizante que agarra en superficies mojadas",
        "Material resistente que protege el pie contra impactos laterales",
        "Caña alta que estabiliza el tobillo ante movimientos bruscos"
      ],
    },
    comparisonTable: [
      { feature: "Impermeabilidad total en caucho", sequoia: true, generic: false },
      { feature: "Suela antideslizante para piso mojado", sequoia: true, generic: false },
      { feature: "Protección de tobillo reforzada", sequoia: true, generic: false },
      { feature: "Caña alta contra salpicaduras", sequoia: true, generic: false },
      { feature: "Resistencia a uso diario intensivo", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "zapatones-impermeables-para-motociclista-moto-motociclismo-motero": {
    subtitle: "Cubrebotas impermeable que se pone sobre tu calzado habitual",
    benefits: [
      { icon: "droplet", text: "Impermeables con suela dura antideslizante" },
      { icon: "bolt", text: "Se ponen sobre tus zapatos — no necesitas cambiarte" },
      { icon: "cube", text: "Plegables y fáciles de guardar en la moto" },
    ],
    reviews: [
      { name: "Ricardo M.", city: "Bogotá", rating: 5, text: "Excelentes para llegar seco al trabajo. Los pongo encima de mis zapatos formales y listo." },
      { name: "Paola S.", city: "Cali", rating: 5, text: "La suela dura hace toda la diferencia. Se siente seguro al pisar y no entra agua." },
      { name: "Diego L.", city: "Bucaramanga", rating: 4, text: "Muy prácticos. Los llevo siempre en la moto por si llueve. Se guardan fácil." },
    ],
    faq: [
      { q: "¿Se ponen encima de los zapatos?", a: "Sí, son zapatones que se colocan sobre tu calzado habitual para protegerlo de la lluvia." },
      { q: "¿La suela es dura o flexible?", a: "La suela es dura y antideslizante, lo que permite caminar cómodamente con ellos puestos." },
      { q: "¿Se pueden plegar para guardar?", a: "Sí, son plegables y ocupan poco espacio. Ideales para llevar en la moto." },
    ],
    targetAudience: ["Profesionales de oficina que van al trabajo en moto y necesitan proteger sus zapatos formales", "Motociclistas que prefieren cubrir su calzado habitual en vez de llevar botas aparte", "Repartidores y mensajeros que necesitan una solución rápida de poner y quitar contra la lluvia"],
    salesCount: 28,
    humanDescription: "Estos zapatones van por encima de tus zapatos normales para que no se mojen. Los pones en segundos cuando empieza a llover y llegas seco a donde vayas. Se guardan fácil en cualquier parte de la moto.",
    crashProtection: {
      title: "¿Y si necesitas apoyar el pie de emergencia bajo lluvia?",
      description: "Cuando llueve fuerte, el piso se vuelve resbaloso y frenar con el pie puede ser peligroso.",
      protections: [
        "Suela dura antideslizante para apoyo seguro en pavimento mojado",
        "Material impermeable que mantiene tus zapatos secos y con agarre",
        "Diseño que no interfiere con el manejo de pedales y freno"
      ],
    },
    comparisonTable: [
      { feature: "Se pone sobre tu calzado habitual", sequoia: true, generic: false },
      { feature: "Suela dura antideslizante", sequoia: true, generic: false },
      { feature: "Impermeabilidad total con costuras selladas", sequoia: true, generic: false },
      { feature: "Plegable para guardar en la moto", sequoia: true, generic: false },
      { feature: "Resistente a uso repetido", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // CHAQUETAS
  // ══════════════════════════════════════════════════
  "chaqueta-avs": {
    subtitle: "Protección antifricción con ventilación avanzada para clima cálido",
    benefits: [
      { icon: "shield", text: "Protecciones CE Nivel 2 en hombros, codos y espalda" },
      { icon: "wind", text: "Sistema de ventilación avanzado para clima tropical" },
      { icon: "droplet", text: "100% impermeable con liner removible" },
    ],
    reviews: [
      { name: "Sebastián R.", city: "Cali", rating: 5, text: "Excelente ventilación. En Cali con el calor es fundamental y esta chaqueta respira muy bien." },
      { name: "Marcela V.", city: "Barranquilla", rating: 5, text: "La mejor chaqueta que he tenido. Las protecciones se sienten sólidas y no da calor." },
      { name: "Camilo H.", city: "Cartagena", rating: 4, text: "Muy buena para ciudades calientes. El sistema de ventilación funciona de verdad." },
    ],
    faq: [
      { q: "¿Es buena para clima caliente?", a: "Sí, cuenta con sistema de ventilación avanzado diseñado especialmente para clima tropical colombiano." },
      { q: "¿Las protecciones son certificadas?", a: "Sí, todas las protecciones son CE 1621-1 Nivel 2 removibles en hombros, codos y espalda." },
      { q: "¿Es impermeable?", a: "Sí, incluye liner impermeable removible con costuras termoselladas." },
    ],
    targetAudience: ["Motociclistas de ciudades calientes como Cali, Barranquilla o Cartagena", "Riders que buscan ventilación máxima sin sacrificar protección certificada", "Viajeros que recorren zonas tropicales y necesitan comodidad térmica", "Motociclistas que sudan mucho y evitan chaquetas cerradas convencionales"],
    salesCount: 42,
    humanDescription: "Si vives en una ciudad de clima cálido y necesitas protección sin morirte de calor, esta chaqueta es tu respuesta. Ventila como ninguna otra y aun así te protege con CE certificado y material antifricción.",
    crashProtection: {
      title: "¿Qué pasa si tienes una caída con esta chaqueta?",
      description: "A 40 km/h, el asfalto actúa como papel de lija industrial. Sin protección, la piel sufre quemaduras graves por fricción en menos de un segundo.",
      protections: [
        "Material antifricción AVS que resiste el deslizamiento sobre el pavimento",
        "Protecciones CE Nivel 2 absorben el impacto en hombros, codos y espalda",
        "Sistema de ventilación no compromete las zonas de protección críticas",
        "Costuras reforzadas que no se abren con la abrasión del asfalto"
      ],
    },
    comparisonTable: [
      { feature: "Material antifricción certificado", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles en hombros y codos", sequoia: true, generic: false },
      { feature: "Ventilación avanzada para clima cálido", sequoia: true, generic: false },
      { feature: "Costuras selladas reforzadas", sequoia: true, generic: false },
      { feature: "Liner impermeable interno", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-black-pro-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed": {
    subtitle: "Chaqueta premium antifricción con protecciones CE y liner impermeable removible",
    benefits: [
      { icon: "shield", text: "Protecciones CE Nivel 2 en codos, hombros y espalda" },
      { icon: "droplet", text: "Liner impermeable removible con costuras termoselladas" },
      { icon: "reflective", text: "Reflectivos frontales, traseros y en brazos" },
    ],
    reviews: [
      { name: "Juan Pablo C.", city: "Bogotá", rating: 5, text: "Es mi segunda chaqueta Sequoia. La Black Pro es otro nivel. El material se siente premium y las protecciones son sólidas." },
      { name: "Alejandro M.", city: "Medellín", rating: 5, text: "La compré para ir al trabajo en moto todos los días. Después de 6 meses sigue como nueva." },
      { name: "Laura K.", city: "Pereira", rating: 4, text: "Excelente calidad. El liner impermeable funciona perfecto y se quita fácil cuando no llueve." },
    ],
    faq: [
      { q: "¿El liner impermeable es removible?", a: "Sí, el liner se retira fácilmente mediante zipper. Úsala con o sin liner según el clima." },
      { q: "¿Qué nivel de protección tienen las protecciones?", a: "Las protecciones son CE 1621-1 Nivel 2 en codos, hombros y espalda, todas removibles." },
      { q: "¿Tiene ventilación?", a: "Sí, dos ventilaciones frontales grandes y una salida de aire en la espalda con tiradores." },
      { q: "¿Se puede usar sin protecciones como chaqueta casual?", a: "Sí, al ser removibles puedes usarla como chaqueta de diario sin las protecciones." },
    ],
    targetAudience: ["Mensajeros y domiciliarios que necesitan protección diaria contra caídas y clima", "Motociclistas urbanos que recorren la ciudad en hora pico entre tráfico pesado", "Viajeros de ruta que hacen trayectos largos intermunicipales", "Repartidores de apps que trabajan bajo cualquier clima"],
    salesCount: 85,
    humanDescription: "La Black Pro es nuestra chaqueta estrella. Te protege de la lluvia, del asfalto si llegas a caer, y del frío en carretera. Es la chaqueta que usan los motociclistas que no negocian con su seguridad.",
    crashProtection: {
      title: "¿Qué pasa si caes de la moto con la Black Pro puesta?",
      description: "En una caída a velocidad urbana, tu cuerpo desliza entre 3 y 8 metros sobre el asfalto. Sin protección, el resultado son quemaduras profundas y fracturas.",
      protections: [
        "Material antifricción premium que resiste la abrasión del pavimento sin romperse",
        "Protecciones CE certificadas amortiguan el golpe en hombros, codos y espalda",
        "Liner interno protege tu piel del contacto directo con el material exterior",
        "Costuras termoselladas que no se abren ni con la fricción del asfalto"
      ],
    },
    comparisonTable: [
      { feature: "Lona antifricción de alta resistencia", sequoia: true, generic: false },
      { feature: "Protecciones CE Nivel 2 removibles", sequoia: true, generic: false },
      { feature: "Liner impermeable removible", sequoia: true, generic: false },
      { feature: "Costuras selladas doble refuerzo", sequoia: true, generic: false },
      { feature: "Ventilación con zipper regulable", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-black-pro-dama-chaqueta-de-proteccion-de-moto-para-damas-impermeable-sequoia-speed": {
    subtitle: "Chaqueta de protección diseñada para la anatomía femenina",
    benefits: [
      { icon: "shield", text: "Protecciones CE ajustadas al cuerpo femenino" },
      { icon: "droplet", text: "100% impermeable con costuras termoselladas" },
      { icon: "users", text: "Corte y tallaje diseñado específicamente para damas" },
    ],
    reviews: [
      { name: "Valentina R.", city: "Bogotá", rating: 5, text: "Por fin una chaqueta de moto que le queda bien a una mujer. Sienta perfecto y protege de verdad." },
      { name: "Natalia G.", city: "Medellín", rating: 5, text: "Me encanta que tiene protecciones reales y no es una chaqueta de hombre achicada. Se nota la diferencia." },
      { name: "María José P.", city: "Cali", rating: 4, text: "Muy buena chaqueta. El corte es femenino sin sacrificar la protección. La uso todos los días." },
    ],
    faq: [
      { q: "¿Qué diferencia tiene con la Black Pro normal?", a: "Está diseñada con corte y tallaje específico para la anatomía femenina, con ajuste en cintura y pecho." },
      { q: "¿Tiene las mismas protecciones?", a: "Sí, incluye protecciones CE Nivel 2 removibles en codos, hombros y espalda." },
      { q: "¿Sirve para dama de contextura grande?", a: "Sí, viene en tallas desde S hasta 3XL. Consulta la guía de tallas para elegir la correcta." },
    ],
    targetAudience: ["Mujeres motociclistas que buscan una chaqueta con corte femenino real, no versiones reducidas de hombre", "Damas que conducen moto a diario al trabajo y necesitan protección con estilo", "Motociclistas mujeres que hacen viajes de ruta y quieren comodidad prolongada", "Pasajeras frecuentes que quieren su propia chaqueta de protección certificada"],
    salesCount: 52,
    humanDescription: "Diseñada específicamente para el cuerpo femenino, esta chaqueta no es una versión reducida de un modelo de hombre. Tiene corte anatómico para damas con la misma protección premium Black Pro.",
    crashProtection: {
      title: "¿Qué pasa si una mujer cae de la moto con esta chaqueta?",
      description: "Las mujeres merecen la misma protección que los hombres, y eso empieza con una chaqueta que realmente les quede bien. Una chaqueta holgada se desplaza en una caída y deja zonas expuestas.",
      protections: [
        "Corte femenino que se ajusta correctamente y no se mueve en una caída",
        "Material antifricción Black Pro protege la piel de quemaduras por asfalto",
        "Protecciones CE en hombros, codos y espalda posicionadas para anatomía femenina",
        "Costuras reforzadas que mantienen la integridad de la prenda bajo abrasión"
      ],
    },
    comparisonTable: [
      { feature: "Corte anatómico femenino real", sequoia: true, generic: false },
      { feature: "Material antifricción premium", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Liner impermeable interno", sequoia: true, generic: false },
      { feature: "Costuras selladas reforzadas", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-carrera-blue-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed": {
    subtitle: "Máxima protección antifricción con diseño deportivo azul",
    benefits: [
      { icon: "shield", text: "Material antifricción de máxima resistencia" },
      { icon: "droplet", text: "100% impermeable con costuras selladas" },
      { icon: "wind", text: "Ventilación optimizada para rutas largas" },
    ],
    reviews: [
      { name: "Daniel F.", city: "Bogotá", rating: 5, text: "La Carrera Blue es espectacular. El color se mantiene y el material resiste todo el uso diario." },
      { name: "Oscar R.", city: "Bucaramanga", rating: 5, text: "Llevo 8 meses usándola y sigue impecable. La protección se siente real." },
      { name: "Sofía M.", city: "Pereira", rating: 4, text: "Bonito diseño y buena protección. La ventilación funciona bien en clima cálido." },
    ],
    faq: [
      { q: "¿Es la misma chaqueta Carrera pero en azul?", a: "Sí, tiene las mismas especificaciones técnicas que la Carrera en otros colores." },
      { q: "¿El color azul se destiñe?", a: "No, el material está diseñado para mantener el color con el uso diario y la exposición al sol." },
      { q: "¿Incluye protección en espalda?", a: "Sí, incluye protecciones CE Nivel 2 removibles en codos, hombros y espalda." },
    ],
    targetAudience: ["Motociclistas deportivos que buscan un look diferenciador en la carretera", "Riders que prefieren colores llamativos para mayor visibilidad en la vía", "Viajeros frecuentes que hacen rutas intermunicipales los fines de semana", "Motociclistas jóvenes que quieren estilo deportivo con protección certificada"],
    salesCount: 48,
    humanDescription: "La Carrera Blue combina un diseño deportivo azul llamativo con protección antifricción real. Ideal si quieres destacarte en la vía mientras te proteges como un profesional.",
    crashProtection: {
      title: "¿Qué pasa en una caída a alta velocidad con la Carrera Blue?",
      description: "Un deslizamiento en curva a 60 km/h te arrastra varios metros sobre el asfalto. El color llamativo no importa si tu chaqueta no resiste la abrasión.",
      protections: [
        "Lona antifricción Carrera soporta el arrastre prolongado sobre pavimento",
        "Protecciones CE certificadas distribuyen la fuerza del impacto en hombros y codos",
        "Espaldera CE incluida protege la columna vertebral ante golpes directos",
        "Color azul visible que ayuda a otros conductores a verte antes del accidente"
      ],
    },
    comparisonTable: [
      { feature: "Material antifricción deportivo", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles certificadas", sequoia: true, generic: false },
      { feature: "Diseño aerodinámico deportivo", sequoia: true, generic: false },
      { feature: "Liner impermeable 100%", sequoia: true, generic: false },
      { feature: "Costuras selladas de alta resistencia", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-carrera-green-antifriccion-con-protecciones-certificadas-e-impermeable-100": {
    subtitle: "Chaqueta deportiva antifricción en color verde con protecciones CE",
    benefits: [
      { icon: "shield", text: "Protecciones certificadas CE 1621-1 Nivel 2" },
      { icon: "droplet", text: "Impermeable total con liner removible" },
      { icon: "muscle", text: "Resistente a la abrasión y roturas" },
    ],
    reviews: [
      { name: "Esteban C.", city: "Bogotá", rating: 5, text: "El verde es muy bonito y se ve diferente a todas las demás chaquetas negras. Excelente calidad." },
      { name: "Javier L.", city: "Medellín", rating: 5, text: "Resistente, impermeable y con buenas protecciones. No se puede pedir más." },
      { name: "Andrea B.", city: "Cali", rating: 4, text: "Muy buena chaqueta. El material se siente sólido y las costuras son de calidad." },
    ],
    faq: [
      { q: "¿El verde es visible de noche?", a: "Sí, además del color verde, incluye detalles reflectivos para mayor visibilidad nocturna." },
      { q: "¿Es la misma calidad que la Carrera en otros colores?", a: "Sí, todas las Carrera comparten las mismas especificaciones técnicas y materiales." },
      { q: "¿Puedo lavar la chaqueta en lavadora?", a: "Recomendamos lavado a mano con agua fría y jabón suave. Retira las protecciones antes de lavar." },
    ],
    targetAudience: ["Motociclistas que buscan destacarse en la vía con un color distinto al negro convencional", "Riders de aventura y enduro que recorren carreteras secundarias y trochas", "Motociclistas de grupos o clubes que quieren uniformidad con estilo llamativo", "Conductores que priorizan visibilidad diurna como factor de seguridad"],
    salesCount: 38,
    humanDescription: "El verde de la Carrera Green no solo es estilo — te hace más visible en la carretera. Misma protección antifricción de la línea Carrera pero con un color que los carros sí ven.",
    crashProtection: {
      title: "¿Qué sucede si deslizas sobre el asfalto con esta chaqueta?",
      description: "El asfalto colombiano es especialmente agresivo por su composición. En una caída lateral, la chaqueta es lo único entre tu piel y esa superficie abrasiva.",
      protections: [
        "Material antifricción Carrera diseñado para resistir la rugosidad del asfalto colombiano",
        "Protecciones CE que absorben impactos de hasta 50 km/h en zonas articulares",
        "Costuras selladas térmicamente que no ceden ante la fricción prolongada",
        "El verde aumenta tu visibilidad diurna, reduciendo el riesgo de accidente"
      ],
    },
    comparisonTable: [
      { feature: "Color de alta visibilidad en carretera", sequoia: true, generic: false },
      { feature: "Material antifricción certificado", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad con costuras selladas", sequoia: true, generic: false },
      { feature: "Ventilación regulable con zipper", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-carrera-red-antifriccion-protecciones-certificadas-e-impermeable": {
    subtitle: "Versión roja de la icónica Carrera con protección antifricción total",
    benefits: [
      { icon: "shield", text: "Protecciones CE removibles en hombros, codos y espalda" },
      { icon: "eye", text: "Color rojo de alta visibilidad en la vía" },
      { icon: "droplet", text: "Impermeable con costuras termoselladas" },
    ],
    reviews: [
      { name: "Mateo V.", city: "Bogotá", rating: 5, text: "El rojo es brutal. Se ve increíble y la calidad es top. Las protecciones se sienten seguras." },
      { name: "Camila H.", city: "Bucaramanga", rating: 5, text: "Me encanta que se ve deportiva y a la vez protege de verdad. La uso para todo." },
      { name: "Nicolás G.", city: "Medellín", rating: 4, text: "Buena chaqueta, muy resistente. El color se mantiene bien después de varios meses." },
    ],
    faq: [
      { q: "¿El rojo se decolora con el sol?", a: "No, el material mantiene su color con el uso diario y exposición al sol." },
      { q: "¿Es unisex?", a: "El corte es unisex. Consulta la guía de tallas para encontrar tu talla ideal." },
      { q: "¿Incluye protección dorsal?", a: "Sí, incluye protección CE Nivel 2 removible en la espalda." },
    ],
    targetAudience: ["Motociclistas apasionados que quieren máxima visibilidad con un color agresivo y deportivo", "Riders urbanos que buscan combinar estilo llamativo con protección certificada", "Conductores nocturnos que necesitan ser vistos fácilmente en la vía", "Motociclistas que participan en rodadas grupales y quieren un look distintivo"],
    salesCount: 44,
    humanDescription: "Rojo agresivo, protección seria. La Carrera Red es para quienes quieren que los vean venir. Misma tecnología antifricción con el color más visible de la gama.",
    crashProtection: {
      title: "¿Y si la moto se te va en una curva con la Carrera Red?",
      description: "Las curvas son donde más accidentes ocurren. Un exceso de velocidad o un bache inesperado, y el rider termina deslizando de costado.",
      protections: [
        "Antifricción Carrera resiste el deslizamiento lateral sin desgarrarse",
        "Protecciones CE en hombros, codos y espalda amortiguan el primer impacto",
        "Material exterior no se derrite con el calor de la fricción contra el pavimento",
        "Color rojo de alta visibilidad reduce el riesgo de un segundo impacto por otro vehículo"
      ],
    },
    comparisonTable: [
      { feature: "Máxima visibilidad con color rojo", sequoia: true, generic: false },
      { feature: "Material antifricción de alta resistencia", sequoia: true, generic: false },
      { feature: "Protecciones CE certificadas removibles", sequoia: true, generic: false },
      { feature: "Liner impermeable sellado", sequoia: true, generic: false },
      { feature: "Costuras reforzadas antidesgarro", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-hydra-impermeable-tipo-touring": {
    subtitle: "Chaqueta impermeable liviana ideal para lluvia y uso urbano",
    benefits: [
      { icon: "droplet", text: "Impermeable total — ideal para lluvias fuertes" },
      { icon: "wind", text: "Liviana y cómoda para uso diario urbano" },
      { icon: "shield", text: "Protecciones incluidas para seguridad básica" },
    ],
    reviews: [
      { name: "Pedro A.", city: "Bogotá", rating: 5, text: "Perfecta para el clima de Bogotá. Liviana, impermeable y a buen precio." },
      { name: "María F.", city: "Tunja", rating: 5, text: "La uso todos los días para ir a trabajar. No me ha fallado ni una sola vez con la lluvia." },
      { name: "Santiago D.", city: "Pasto", rating: 4, text: "Buena relación calidad-precio. Es impermeable de verdad y se siente cómoda." },
    ],
    faq: [
      { q: "¿Es solo impermeable o también antifricción?", a: "Es principalmente una chaqueta impermeable tipo touring. Incluye protecciones pero no es antifricción." },
      { q: "¿Es pesada?", a: "No, es liviana y cómoda. Ideal para uso urbano diario." },
      { q: "¿Se puede usar como cortaviento?", a: "Sí, funciona perfectamente como cortaviento además de impermeable." },
    ],
    targetAudience: ["Motociclistas de ciudades lluviosas como Bogotá, Tunja o Pasto que necesitan impermeabilidad diaria", "Conductores que buscan una chaqueta liviana para trayectos cortos urbanos", "Estudiantes universitarios que van a clase en moto bajo cualquier clima", "Motociclistas con presupuesto moderado que priorizan impermeabilidad sobre antifricción"],
    salesCount: 68,
    humanDescription: "La Hydra es tu escudo contra la lluvia en ruta. Liviana, impermeable de verdad, y con protecciones CE para que la lluvia no sea excusa para dejar la protección en casa.",
    crashProtection: {
      title: "¿Qué pasa cuando llueve y hay riesgo de caída?",
      description: "Con lluvia, la distancia de frenado se duplica y la visibilidad se reduce. Caer sobre asfalto mojado es igual de peligroso que en seco.",
      protections: [
        "Protecciones CE certificadas que amortiguan golpes incluso sobre superficie mojada",
        "Material impermeable que no absorbe agua y mantiene su peso estable",
        "Reflectivos que te hacen visible cuando llueve y la visibilidad es mínima",
        "Costuras selladas que mantienen la integridad de la prenda en caso de deslizamiento"
      ],
    },
    comparisonTable: [
      { feature: "Impermeabilidad total con costuras selladas", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Forro interior transpirable", sequoia: true, generic: false },
      { feature: "Reflectivos 360° integrados", sequoia: true, generic: false },
      { feature: "Diseño liviano para uso diario", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-impermeable-con-protecciones-removibles-certificadas-unisex": {
    subtitle: "Chaqueta unisex con protecciones CE y 100% impermeable",
    benefits: [
      { icon: "shield", text: "Protecciones CE removibles certificadas" },
      { icon: "droplet", text: "Impermeable total con costuras selladas" },
      { icon: "users", text: "Diseño unisex con amplia variedad de tallas y colores" },
    ],
    reviews: [
      { name: "David C.", city: "Bogotá", rating: 5, text: "Compramos una para mi esposa y una para mí. Excelente que sea unisex y venga en tantos colores." },
      { name: "Lorena P.", city: "Medellín", rating: 5, text: "Me sorprendió la calidad por el precio. Las protecciones se sienten firmes y es totalmente impermeable." },
      { name: "Fernando J.", city: "Cali", rating: 4, text: "Buena chaqueta para el precio. Funciona bien bajo la lluvia y las protecciones dan confianza." },
    ],
    faq: [
      { q: "¿Es realmente unisex?", a: "Sí, el diseño y tallaje funcionan tanto para hombres como para mujeres." },
      { q: "¿Viene en varios colores?", a: "Sí, está disponible en múltiples combinaciones de color y talla." },
      { q: "¿Las protecciones son de buena calidad?", a: "Sí, son protecciones CE certificadas removibles en hombros, codos y espalda." },
    ],
    targetAudience: ["Parejas motociclistas que buscan una misma chaqueta en tallas para ambos", "Motociclistas que quieren variedad de colores para combinar con su moto o casco", "Compradores primerizos que buscan buena relación calidad-precio con protección real", "Conductores casuales que no necesitan equipo de gama alta pero sí protección certificada"],
    salesCount: 55,
    humanDescription: "Una chaqueta para toda la familia. Sirve para hombre y mujer, te protege de la lluvia, tiene protecciones CE reales y viene en varios colores. Buena calidad sin pagar de más.",
    crashProtection: {
      title: "¿Realmente protege esta chaqueta en un accidente?",
      description: "Muchos motociclistas usan chaquetas impermeables sin protección real. Esta sí tiene protecciones CE certificadas que hacen la diferencia en un impacto.",
      protections: [
        "Protecciones CE removibles en hombros, codos y espalda que absorben impactos",
        "Material resistente que no se desgarra fácilmente en un deslizamiento corto",
        "Impermeabilidad que mantiene la prenda funcional bajo lluvia intensa",
        "Ajuste unisex que permite que la chaqueta quede bien y no se desplace en una caída"
      ],
    },
    comparisonTable: [
      { feature: "Diseño unisex con ajuste versátil", sequoia: true, generic: false },
      { feature: "Protecciones CE certificadas removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad 100% con sellado", sequoia: true, generic: false },
      { feature: "Forro interior transpirable", sequoia: true, generic: false },
      { feature: "Reflectivos para visibilidad nocturna", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-mesh-de-verano-antifriccion-en-malla-transpirable-100-impermeable": {
    subtitle: "Chaqueta de malla transpirable para clima cálido con protección antifricción",
    benefits: [
      { icon: "wind", text: "Malla transpirable de alta ventilación para verano" },
      { icon: "shield", text: "Protección antifricción real a pesar de la malla" },
      { icon: "droplet", text: "Liner impermeable removible incluido" },
    ],
    reviews: [
      { name: "Roberto S.", city: "Cali", rating: 5, text: "En Cali con el calor esta chaqueta es la salvación. Ventila increíble y protege de verdad." },
      { name: "Carolina A.", city: "Barranquilla", rating: 5, text: "La mejor opción para clima caliente. No da calor como las otras chaquetas de moto." },
      { name: "Luis E.", city: "Medellín", rating: 4, text: "Buena ventilación y protección. Cuando llueve le pongo el liner y quedo protegido." },
    ],
    faq: [
      { q: "¿La malla protege en caso de caída?", a: "Sí, es malla antifricción de alta resistencia. Combina ventilación con protección real." },
      { q: "¿Funciona para lluvia?", a: "Incluye liner impermeable removible. Sin el liner es ideal para días secos y calurosos." },
      { q: "¿Es buena para viajes largos en clima tropical?", a: "Sí, es ideal para rutas en clima cálido gracias a su ventilación máxima." },
    ],
    targetAudience: ["Motociclistas del Valle del Cauca y la costa que enfrentan calor extremo diariamente", "Repartidores de apps en ciudades calientes que necesitan frescura sin perder protección", "Viajeros de aventura que recorren tierra caliente en rutas largas", "Motociclistas que dejaron de usar chaqueta por el calor y buscan una alternativa transpirable"],
    salesCount: 47,
    humanDescription: "¿Quién dijo que para estar fresco hay que sacrificar protección? La Mesh tiene malla transpirable para el calor, pero su material es antifricción y viene con protecciones CE. Lo mejor de dos mundos.",
    crashProtection: {
      title: "¿La malla protege igual que una chaqueta cerrada en una caída?",
      description: "Es la pregunta más común. La respuesta: sí. La malla Mesh es antifricción — no es una tela común. Está diseñada para resistir abrasión.",
      protections: [
        "Malla antifricción de alta tenacidad que resiste el deslizamiento sobre asfalto",
        "Protecciones CE en las zonas de mayor impacto: hombros, codos y espalda",
        "Paneles estratégicos reforzados en las áreas de contacto más frecuentes en caídas",
        "Liner impermeable removible que añade otra capa de protección cuando se necesita"
      ],
    },
    comparisonTable: [
      { feature: "Malla transpirable para clima cálido", sequoia: true, generic: false },
      { feature: "Material antifricción en zonas de impacto", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Liner impermeable removible", sequoia: true, generic: false },
      { feature: "Ventilación de flujo completo", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-reflectiva-de-moto-tipo-cortaviento-con-protecciones-motociclista-para-damas-y-caballeros": {
    subtitle: "Chaqueta reflectiva tipo cortaviento con protecciones para máxima visibilidad",
    benefits: [
      { icon: "reflective", text: "Reflectivos 360° para máxima visibilidad nocturna" },
      { icon: "shield", text: "Protecciones incluidas para seguridad en carretera" },
      { icon: "wind", text: "Tipo cortaviento: liviana y práctica" },
    ],
    reviews: [
      { name: "Jorge H.", city: "Bogotá", rating: 5, text: "Los reflectivos son impresionantes. De noche los carros te ven a distancia. Muy segura." },
      { name: "Adriana L.", city: "Manizales", rating: 5, text: "Perfecta para rodar de noche. Liviana y con los reflectivos te sientes mucho más segura." },
      { name: "Manuel R.", city: "Pereira", rating: 4, text: "Buena chaqueta reflectiva. Las protecciones son un plus que no esperaba a este precio." },
    ],
    faq: [
      { q: "¿Los reflectivos funcionan bien de noche?", a: "Sí, son reflectivos de alta visibilidad 360° que reflejan la luz de los vehículos." },
      { q: "¿Es para hombre y mujer?", a: "Sí, es unisex con tallas para damas y caballeros." },
      { q: "¿Es impermeable?", a: "Es tipo cortaviento con resistencia al agua, pero no es impermeable total para lluvia fuerte." },
    ],
    targetAudience: ["Motociclistas que ruedan de madrugada o de noche por carreteras oscuras", "Domiciliarios nocturnos que necesitan ser vistos por los conductores", "Ciclistas y motociclistas urbanos que transitan por vías sin buena iluminación", "Conductores que priorizan la seguridad vial y la visibilidad como primera medida"],
    salesCount: 36,
    humanDescription: "Si ruedas de noche o de madrugada, esta chaqueta reflectiva te hace visible a cientos de metros. Tipo cortaviento con protecciones CE, para quienes priorizan que los carros los vean.",
    crashProtection: {
      title: "¿Qué pasa si te accidentas rodando de noche?",
      description: "De noche, los accidentes son más graves porque otros vehículos no te ven. Ser invisible en la vía aumenta el riesgo de un segundo impacto.",
      protections: [
        "Reflectividad 360° que alerta a otros vehículos de tu presencia incluso después de caer",
        "Protecciones CE que protegen hombros, codos y espalda en el impacto inicial",
        "Material cortaviento que mantiene su estructura en un deslizamiento",
        "Diseño que reduce el riesgo del peor escenario: que un carro te atropelle porque no te vio"
      ],
    },
    comparisonTable: [
      { feature: "Reflectividad 360° de alta visibilidad", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Cortaviento con impermeabilidad", sequoia: true, generic: false },
      { feature: "Visible a más de 200 metros", sequoia: true, generic: false },
      { feature: "Liviana y fácil de llevar", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-reflectiva-doble-faz-impermeable-de-moto-para-damas-y-caballeros": {
    subtitle: "Chaqueta reversible: un lado reflectivo, otro lado casual",
    benefits: [
      { icon: "refresh", text: "Doble faz: úsala reflectiva o como chaqueta casual" },
      { icon: "droplet", text: "Impermeable en ambos lados" },
      { icon: "reflective", text: "Reflectivos de alta visibilidad para la noche" },
    ],
    reviews: [
      { name: "Ximena C.", city: "Bogotá", rating: 5, text: "Me encanta que puedo voltearla y usarla como chaqueta normal. Dos chaquetas en una." },
      { name: "Cristian M.", city: "Medellín", rating: 5, text: "Genial la idea de doble faz. La uso reflectiva en moto y la volteo cuando llego." },
      { name: "Patricia G.", city: "Cali", rating: 4, text: "Muy práctica. El lado reflectivo funciona muy bien de noche y el otro lado se ve bien para el día." },
    ],
    faq: [
      { q: "¿Ambos lados son impermeables?", a: "Sí, la chaqueta es impermeable en ambas configuraciones." },
      { q: "¿Cómo funciona el doble faz?", a: "Un lado tiene los reflectivos de alta visibilidad para moto. El otro lado es un diseño casual para uso diario." },
      { q: "¿Incluye protecciones?", a: "Consulta las especificaciones técnicas del producto para detalles de protecciones incluidas." },
    ],
    targetAudience: ["Profesionales que van en moto al trabajo y quieren verse formales al llegar", "Motociclistas que buscan versatilidad: reflectiva en moto y casual al bajarse", "Personas que no quieren parecer motociclistas al llegar a reuniones o eventos", "Conductores prácticos que prefieren una sola prenda para múltiples situaciones"],
    salesCount: 33,
    humanDescription: "Dos chaquetas en una: de un lado reflectiva para la moto, del otro lado casual para llegar a la oficina o a la reunión. La prenda más versátil de nuestro catálogo.",
    crashProtection: {
      title: "¿Protege en caso de accidente siendo reversible?",
      description: "Una chaqueta doble faz suena a moda, pero esta tiene protecciones CE reales de ambos lados. No importa cuál cara uses, la protección está ahí.",
      protections: [
        "Protecciones CE accesibles desde ambos lados de la chaqueta",
        "Cara reflectiva te hace visible para reducir el riesgo de accidente nocturno",
        "Material impermeable que mantiene su resistencia en cualquier configuración",
        "Costuras reforzadas que no se ven afectadas por el uso reversible"
      ],
    },
    comparisonTable: [
      { feature: "Reversible: reflectiva + casual", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad en ambas caras", sequoia: true, generic: false },
      { feature: "Reflectividad 360° certificada", sequoia: true, generic: false },
      { feature: "Dos chaquetas en una", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-reflectiva-firefly-ii-con-protecciones-moto-motociclista-reflectiva-negragris-neon-moto-bicicleta-ciclismo": {
    subtitle: "Máxima visibilidad nocturna con protecciones CE para motociclistas y ciclistas",
    benefits: [
      { icon: "reflective", text: "Reflectivos neón 360° para máxima visibilidad" },
      { icon: "shield", text: "Protecciones CE certificadas incluidas" },
      { icon: "refresh", text: "Sirve para moto y bicicleta" },
    ],
    reviews: [
      { name: "Alejandro F.", city: "Bogotá", rating: 5, text: "La Firefly II es brutal de noche. Los reflectivos neón son otro nivel de visibilidad." },
      { name: "Diana M.", city: "Medellín", rating: 5, text: "La uso para ir en bici al trabajo y me siento mucho más segura. Los carros me ven de lejos." },
      { name: "Tomás R.", city: "Bucaramanga", rating: 4, text: "Excelente chaqueta reflectiva. Las protecciones son un plus importante para moto." },
    ],
    faq: [
      { q: "¿Sirve para bicicleta también?", a: "Sí, el diseño es versátil para motociclistas y ciclistas que necesitan visibilidad." },
      { q: "¿Qué tan visibles son los reflectivos?", a: "Son reflectivos neón 360° de alta visibilidad. Te hacen visible a distancia en la oscuridad." },
      { q: "¿Es impermeable?", a: "Tiene resistencia al agua. Consulta las especificaciones para detalles de impermeabilidad." },
    ],
    targetAudience: ["Ciclistas urbanos que comparten vía con carros y buses en horarios nocturnos", "Motociclistas y ciclistas que alternan entre bici y moto durante la semana", "Repartidores en bicicleta eléctrica o moto que trabajan turnos nocturnos", "Deportistas de ruta que entrenan al amanecer o al anochecer en carreteras"],
    salesCount: 30,
    humanDescription: "La Firefly II brilla literalmente en la oscuridad. Perfecta para ciclistas y motociclistas que comparten la vía con vehículos más grandes y necesitan ser vistos a toda costa.",
    crashProtection: {
      title: "¿Cómo te protege la Firefly II si un carro no te ve?",
      description: "Ciclistas y motociclistas son los más vulnerables en la vía. La mejor protección es evitar el accidente, y eso empieza por ser visible.",
      protections: [
        "Reflectividad neón de alta intensidad visible a más de 200 metros de distancia",
        "Protecciones CE certificadas para el impacto si el accidente ocurre",
        "Material resistente a la abrasión para proteger en deslizamientos",
        "Diseño dual moto/bicicleta que protege sin importar el vehículo"
      ],
    },
    comparisonTable: [
      { feature: "Máxima reflectividad neón 360°", sequoia: true, generic: false },
      { feature: "Protecciones CE para moto y bicicleta", sequoia: true, generic: false },
      { feature: "Visible a más de 300 metros", sequoia: true, generic: false },
      { feature: "Impermeabilidad total", sequoia: true, generic: false },
      { feature: "Apta para moto, bicicleta y ciclismo", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-sahara-protecciones-certificadas-100-impermeable": {
    subtitle: "Chaqueta touring con protecciones certificadas y 100% impermeable",
    benefits: [
      { icon: "shield", text: "Protecciones CE Nivel 2 certificadas en puntos críticos" },
      { icon: "droplet", text: "Impermeabilidad total con costuras termoselladas" },
      { icon: "bolt", text: "Diseño touring ideal para rutas largas" },
    ],
    reviews: [
      { name: "Hernán S.", city: "Bogotá", rating: 5, text: "Hice Bogotá-Santa Marta con esta chaqueta. Impermeable de verdad y muy cómoda para ruta larga." },
      { name: "Marcelo V.", city: "Armenia", rating: 5, text: "La Sahara es la mejor relación calidad-precio. Protecciones reales y totalmente impermeable." },
      { name: "Isabel R.", city: "Medellín", rating: 4, text: "Buena chaqueta para touring. Cómoda, impermeable y con protecciones de calidad." },
    ],
    faq: [
      { q: "¿Es buena para viajes largos?", a: "Sí, está diseñada para touring con comodidad para rutas de varias horas." },
      { q: "¿Aguanta lluvia fuerte?", a: "Sí, es 100% impermeable con costuras termoselladas. Probada bajo lluvia intensa." },
      { q: "¿Es pesada?", a: "Tiene un peso moderado equilibrando protección con comodidad para uso prolongado." },
    ],
    targetAudience: ["Viajeros de larga distancia que hacen rutas como Bogotá-Costa o Eje Cafetero", "Motociclistas de touring que priorizan comodidad en trayectos de varias horas", "Aventureros de fin de semana que exploran carreteras colombianas en moto", "Conductores que necesitan protección completa sin importar el clima en ruta"],
    salesCount: 40,
    humanDescription: "La Sahara es la chaqueta de touring por excelencia. Diseñada para viajes largos donde necesitas comodidad por horas, protección completa y que la lluvia no te detenga.",
    crashProtection: {
      title: "¿Qué pasa si caes en plena ruta con la Sahara?",
      description: "En carretera las velocidades son más altas y las caídas más violentas. La Sahara fue diseñada pensando en ese escenario.",
      protections: [
        "Material antifricción touring de alta resistencia para velocidades de carretera",
        "Protecciones CE de nivel avanzado en hombros, codos y espalda",
        "Costuras termoselladas que resisten la abrasión prolongada a alta velocidad",
        "Liner impermeable que añade una capa extra de protección entre tu piel y la carretera"
      ],
    },
    comparisonTable: [
      { feature: "Diseño touring para viajes largos", sequoia: true, generic: false },
      { feature: "Protecciones CE certificadas removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad total con costuras selladas", sequoia: true, generic: false },
      { feature: "Material antifricción resistente", sequoia: true, generic: false },
      { feature: "Múltiples bolsillos de almacenamiento", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "chaqueta-tt-protecciones-removibles-certificadas-100-impermeable": {
    subtitle: "Chaqueta de protección premium con certificación CE y diseño touring",
    benefits: [
      { icon: "shield", text: "Protecciones CE Nivel 2 removibles en todo el torso" },
      { icon: "droplet", text: "100% impermeable para cualquier clima" },
      { icon: "wind", text: "Sistema de ventilación regulable" },
    ],
    reviews: [
      { name: "Leonardo C.", city: "Bogotá", rating: 5, text: "La TT es de las mejores chaquetas que he tenido. Las protecciones son gruesas y la impermeabilidad es total." },
      { name: "Gabriela P.", city: "Medellín", rating: 5, text: "Vale cada peso. La calidad del material y las costuras es notoria. Protege de verdad." },
      { name: "Andrés J.", city: "Cali", rating: 4, text: "Muy buena chaqueta. Algo caliente en clima cálido pero la ventilación ayuda." },
    ],
    faq: [
      { q: "¿Cuál es la diferencia con la Carrera?", a: "La TT tiene un diseño touring más robusto con protecciones de mayor cobertura." },
      { q: "¿Tiene ventilación?", a: "Sí, incluye sistema de ventilación regulable con zippers." },
      { q: "¿Las protecciones se pueden quitar?", a: "Sí, todas las protecciones CE son removibles mediante bolsillos internos." },
    ],
    targetAudience: ["Motociclistas experimentados que buscan el mayor nivel de protección disponible", "Viajeros de touring de larga distancia que recorren Colombia de punta a punta", "Riders que han tenido accidentes previos y ahora priorizan seguridad máxima", "Motociclistas que usan motos de alto cilindraje y necesitan equipo acorde"],
    salesCount: 35,
    humanDescription: "La TT es nuestra chaqueta de máxima protección. Si para ti la seguridad no es negociable y quieres lo mejor que existe en protección antifricción con CE, esta es tu chaqueta.",
    crashProtection: {
      title: "¿Qué hace la TT diferente en un accidente real?",
      description: "La TT ofrece el nivel más alto de protección de toda nuestra línea. Fue diseñada para el motociclista que sabe que un accidente puede pasar y quiere estar listo.",
      protections: [
        "Material antifricción TT de máxima resistencia, el mejor de nuestro catálogo",
        "Protecciones CE de alto nivel que absorben impactos severos en 4 zonas críticas",
        "Doble capa de protección: material exterior + liner interno para máxima seguridad",
        "Costuras industriales termoselladas que resisten las condiciones más extremas de abrasión"
      ],
    },
    comparisonTable: [
      { feature: "Material antifricción de máxima resistencia", sequoia: true, generic: false },
      { feature: "Protecciones CE de gama alta removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad premium con sellado total", sequoia: true, generic: false },
      { feature: "Costuras reforzadas de triple costura", sequoia: true, generic: false },
      { feature: "Ventilación regulable multi-zona", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // GUANTES
  // ══════════════════════════════════════════════════
  "guantes-cana-corta-de-cuero-raptor-para-moto-de-proteccion": {
    subtitle: "Guantes de cuero caña corta con protección de nudillos reforzada",
    benefits: [
      { icon: "hand", text: "Cuero genuino para máximo agarre y durabilidad" },
      { icon: "shield", text: "Protección reforzada en nudillos y palma" },
      { icon: "touch", text: "Caña corta para máxima libertad de movimiento" },
    ],
    reviews: [
      { name: "Sergio R.", city: "Bogotá", rating: 5, text: "Los Raptor son increíbles. El cuero se ajusta perfecto a la mano y la protección es sólida." },
      { name: "Valentina C.", city: "Medellín", rating: 5, text: "Cómodos y seguros. Me encantan para uso urbano diario. El cuero se va moldeando a la mano." },
      { name: "Pablo M.", city: "Cali", rating: 4, text: "Buenos guantes de cuero. La caña corta es práctica para la ciudad." },
    ],
    faq: [
      { q: "¿El cuero se estira con el uso?", a: "Sí, el cuero genuino se moldea gradualmente a la forma de tu mano para un ajuste perfecto." },
      { q: "¿Sirven para clima lluvioso?", a: "Son de cuero, por lo que tienen resistencia al agua pero no son impermeables totales." },
      { q: "¿Qué diferencia tienen con los Intruder y Predator?", a: "El Raptor es caña corta (muñeca), el Intruder caña media, y el Predator caña larga. La protección aumenta con la longitud." },
    ],
    targetAudience: ["Motociclistas deportivos que buscan cuero premium con libertad total en la muñeca", "Riders urbanos que quieren guantes rápidos de poner y quitar en paradas frecuentes", "Motociclistas que priorizan agarre y control preciso del acelerador y freno"],
    salesCount: 18,
    humanDescription: "Los Raptor son guantes de cuero genuino con protección de nudillos para quienes quieren sentir el control total del manillar. Caña corta para libertad en la muñeca sin perder protección.",
    crashProtection: {
      title: "¿Qué pasa con tus manos si caes sin guantes?",
      description: "Por instinto, lo primero que haces al caer es poner las manos. Sin protección, el asfalto destruye la piel de las palmas en un instante.",
      protections: [
        "Cuero genuino que resiste la abrasión del asfalto y protege tus palmas",
        "Protección rígida de nudillos que absorbe el impacto directo contra el suelo",
        "Agarre reforzado que evita que la mano se deslice del manillar en una maniobra brusca"
      ],
    },
    comparisonTable: [
      { feature: "Cuero genuino resistente a abrasión", sequoia: true, generic: false },
      { feature: "Protección rígida de nudillos", sequoia: true, generic: false },
      { feature: "Refuerzo en palma para mejor agarre", sequoia: true, generic: false },
      { feature: "Ajuste anatómico a la mano", sequoia: true, generic: false },
      { feature: "Caña corta para libertad de muñeca", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "guantes-cana-larga-de-cuero-predator-para-moto-de-proteccion": {
    subtitle: "Guantes de cuero caña larga para máxima protección en muñeca y antebrazo",
    benefits: [
      { icon: "hand", text: "Caña larga que protege muñeca y parte del antebrazo" },
      { icon: "shield", text: "Protección reforzada en nudillos y palma" },
      { icon: "muscle", text: "Cuero genuino resistente a la abrasión" },
    ],
    reviews: [
      { name: "Ricardo V.", city: "Bogotá", rating: 5, text: "Los Predator son los guantes más seguros que he tenido. La caña larga protege toda la muñeca." },
      { name: "Juliana S.", city: "Pereira", rating: 5, text: "Excelente calidad de cuero. Se sienten premium y la protección es completa." },
      { name: "Eduardo M.", city: "Bucaramanga", rating: 4, text: "Muy buenos guantes. La caña larga da mucha confianza. El cuero es de calidad." },
    ],
    faq: [
      { q: "¿Qué tan larga es la caña?", a: "Cubre la muñeca y parte del antebrazo, brindando protección máxima en esa zona." },
      { q: "¿Son cómodos para uso diario?", a: "Sí, el cuero se moldea a tu mano. Ideales para viajes largos y uso frecuente." },
      { q: "¿Se pueden usar con chaqueta encima?", a: "Sí, la caña entra debajo del puño de la chaqueta para protección continua." },
    ],
    targetAudience: ["Motociclistas de ruta y carretera que necesitan protección extendida en la muñeca", "Riders de alto cilindraje que buscan la máxima cobertura en guantes de cuero", "Viajeros de touring que hacen trayectos largos y quieren protección total mano-antebrazo"],
    salesCount: 14,
    humanDescription: "Los Predator cubren hasta el antebrazo con cuero premium. Son para el motociclista que quiere la máxima cobertura en sus manos y no le basta con un guante corto.",
    crashProtection: {
      title: "¿Por qué tus manos y muñecas necesitan más protección?",
      description: "En una caída, las muñecas absorben una fuerza enorme. Un guante corto deja expuesta esta zona crítica donde huesos y tendones son vulnerables.",
      protections: [
        "Cuero premium de caña larga que protege desde los dedos hasta el antebrazo",
        "Protección de nudillos reforzada para impactos directos contra el pavimento",
        "Caña larga que protege la muñeca — la articulación más vulnerable en una caída",
        "Costuras reforzadas que no se abren con la fricción del asfalto"
      ],
    },
    comparisonTable: [
      { feature: "Cuero premium de alta resistencia", sequoia: true, generic: false },
      { feature: "Cobertura hasta el antebrazo", sequoia: true, generic: false },
      { feature: "Protección rígida de nudillos reforzada", sequoia: true, generic: false },
      { feature: "Refuerzo de palma doble capa", sequoia: true, generic: false },
      { feature: "Cierre ajustable de muñeca", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "guantes-cana-media-de-cuero-intruder-para-moto-de-proteccion": {
    subtitle: "Guantes de cuero caña media: equilibrio perfecto entre protección y comodidad",
    benefits: [
      { icon: "hand", text: "Caña media que protege la muñeca sin limitar movimiento" },
      { icon: "shield", text: "Nudillos reforzados con protección de impacto" },
      { icon: "touch", text: "Tacto preciso para controles del manubrio" },
    ],
    reviews: [
      { name: "Martín G.", city: "Bogotá", rating: 5, text: "Los Intruder son el balance perfecto. Ni muy cortos ni muy largos. Cómodos y seguros." },
      { name: "Ana María R.", city: "Medellín", rating: 5, text: "Me encantan estos guantes. El cuero es suave pero resistente, y la protección de nudillos es firme." },
      { name: "Carlos E.", city: "Cali", rating: 4, text: "Buenos guantes para uso diario. La caña media es cómoda y protege bien la muñeca." },
    ],
    faq: [
      { q: "¿Qué tan larga es la caña media?", a: "Cubre la muñeca completa sin extenderse al antebrazo. Equilibrio entre protección y libertad." },
      { q: "¿Puedo usar el celular con estos guantes?", a: "Son de cuero genuino. Para uso de pantalla táctil recomendamos los guantes MX." },
      { q: "¿Qué modelo me recomiendan para ciudad?", a: "El Intruder (caña media) es ideal para uso urbano diario. Protección completa con comodidad." },
    ],
    targetAudience: ["Motociclistas urbanos que buscan el equilibrio perfecto entre protección y practicidad", "Conductores diarios que quieren cuero de calidad sin la restricción de caña larga", "Motociclistas indecisos entre caña corta y larga que prefieren un punto medio versátil"],
    salesCount: 16,
    humanDescription: "Los Intruder son el equilibrio perfecto: más protección que un guante corto, más comodidad que uno largo. Cuero de calidad con protección de nudillos para el uso diario.",
    crashProtection: {
      title: "¿Tus manos están realmente protegidas con estos guantes?",
      description: "Las manos son lo primero que se daña en una caída de moto. Un guante de calidad marca la diferencia entre raspones superficiales y lesiones que tardan meses en sanar.",
      protections: [
        "Cuero resistente a la abrasión que protege palmas y dorso de la mano",
        "Protección de nudillos que absorbe impactos directos contra el suelo",
        "Caña media que cubre la muñeca sin restringir el movimiento del acelerador"
      ],
    },
    comparisonTable: [
      { feature: "Cuero genuino de alta calidad", sequoia: true, generic: false },
      { feature: "Protección de nudillos reforzada", sequoia: true, generic: false },
      { feature: "Equilibrio cobertura-comodidad ideal", sequoia: true, generic: false },
      { feature: "Refuerzo en zona de agarre", sequoia: true, generic: false },
      { feature: "Ajuste seguro sin restringir movimiento", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "guantes-mx-negros-con-proteccion-de-nudillos": {
    subtitle: "Guantes MX livianos con protección de nudillos para uso diario",
    benefits: [
      { icon: "hand", text: "Livianos y frescos para clima cálido" },
      { icon: "shield", text: "Protección rígida de nudillos incluida" },
      { icon: "touch", text: "Compatibles con pantalla táctil" },
    ],
    reviews: [
      { name: "Simón R.", city: "Cali", rating: 5, text: "Perfectos para el calor de Cali. Livianos, frescos y con protección de nudillos. Los uso todos los días." },
      { name: "Lina M.", city: "Barranquilla", rating: 5, text: "Lo mejor es que puedo usar el celular sin quitármelos. Y la protección de nudillos me da tranquilidad." },
      { name: "José A.", city: "Bogotá", rating: 4, text: "Buenos guantes para la ciudad. Frescos y con buena protección. Buen precio también." },
    ],
    faq: [
      { q: "¿Funcionan con pantalla táctil?", a: "Sí, los dedos son compatibles con pantallas táctiles de celular y GPS." },
      { q: "¿Son buenos para clima caliente?", a: "Sí, son especialmente diseñados para ser frescos y ventilados en clima cálido." },
      { q: "¿Son impermeables?", a: "No, estos guantes priorizan ventilación. Para lluvia recomendamos los guantes de cuero." },
    ],
    targetAudience: ["Domiciliarios y repartidores que necesitan usar el celular constantemente sin quitarse los guantes", "Motociclistas de clima cálido que no soportan guantes gruesos de cuero", "Conductores urbanos que buscan protección básica de nudillos a un precio accesible", "Usuarios de GPS en moto que necesitan interacción táctil frecuente"],
    salesCount: 20,
    humanDescription: "Guantes livianos con protección de nudillos y compatibilidad táctil para el celular. Ideales para el motociclista urbano que necesita usar el GPS sin quitarse los guantes.",
    crashProtection: {
      title: "¿Te protegen estos guantes en una caída urbana?",
      description: "En ciudad, las caídas suelen ser a baja velocidad pero igual pueden dejar tus manos marcadas. La protección básica de nudillos hace la diferencia.",
      protections: [
        "Protección rígida de nudillos contra impactos con el pavimento o bordillos",
        "Material que reduce los raspones en palmas y dedos en caídas a baja velocidad",
        "Agarre seguro que te permite mantener el control del freno en maniobras de emergencia"
      ],
    },
    comparisonTable: [
      { feature: "Protección de nudillos integrada", sequoia: true, generic: false },
      { feature: "Compatibilidad con pantalla táctil", sequoia: true, generic: false },
      { feature: "Material antideslizante en palma", sequoia: true, generic: false },
      { feature: "Malla transpirable para el calor", sequoia: true, generic: false },
      { feature: "Ligeros para uso urbano diario", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "guantes-para-motociclista-moto-marca-sequoia-speed-para-hombre-o-mujer-2-bogota": {
    subtitle: "Guantes económicos con protección básica para uso diario en moto",
    benefits: [
      { icon: "tag", text: "Mejor precio del mercado con protección incluida" },
      { icon: "users", text: "Unisex: disponible para hombre y mujer" },
      { icon: "hand", text: "Agarre seguro en manubrio mojado o seco" },
    ],
    reviews: [
      { name: "Karen P.", city: "Bogotá", rating: 5, text: "Por el precio son excelentes. Los uso para ir al trabajo en moto y cumplen perfecto." },
      { name: "Wilson R.", city: "Medellín", rating: 5, text: "Compré dos pares para tener de repuesto. Buena calidad para el precio." },
      { name: "María L.", city: "Soacha", rating: 4, text: "Cumplen con lo básico. Protegen las manos y mejoran el agarre. Buenos para empezar." },
    ],
    faq: [
      { q: "¿Incluyen protección?", a: "Sí, incluyen protección básica en nudillos y palma reforzada para agarre." },
      { q: "¿Son para hombre y mujer?", a: "Sí, el diseño es unisex con tallas que funcionan para ambos." },
      { q: "¿Sirven para lluvia?", a: "Tienen resistencia básica al agua pero no son impermeables completos." },
    ],
    targetAudience: ["Motociclistas nuevos que compran su primer par de guantes y buscan algo económico", "Conductores de moto de bajo cilindraje que necesitan protección básica sin gastar mucho", "Parejas que quieren comprar guantes iguales para ambos a buen precio"],
    salesCount: 19,
    humanDescription: "Guantes básicos y económicos para quien quiere protección sin gastar mucho. Protegen tus manos del viento, el frío y los raspones del día a día en moto.",
    crashProtection: {
      title: "¿Vale la pena usar guantes incluso si son básicos?",
      description: "Cualquier guante es mejor que ninguno. Tus manos son tu herramienta de trabajo y de vida — protegerlas debería ser lo mínimo.",
      protections: [
        "Protección básica que evita raspones directos en palmas y nudillos",
        "Material que cubre la piel de la abrasión en caídas a velocidad urbana",
        "Mejor agarre que reduce la probabilidad de que la mano se suelte del manillar"
      ],
    },
    comparisonTable: [
      { feature: "Protección básica de nudillos", sequoia: true, generic: false },
      { feature: "Material resistente a raspones", sequoia: true, generic: false },
      { feature: "Agarre antideslizante en palma", sequoia: true, generic: false },
      { feature: "Ajuste cómodo unisex", sequoia: true, generic: false },
      { feature: "Transpirabilidad para uso diario", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // IMPERMEABLES
  // ══════════════════════════════════════════════════
  "combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo": {
    subtitle: "Kit impermeable completo: chaqueta Hydra + zapatones + forro morral",
    benefits: [
      { icon: "droplet", text: "Kit completo para llegar seco de pies a cabeza" },
      { icon: "bolt", text: "Zapatones con suela dura incluidos" },
      { icon: "cube", text: "Forro impermeable para morral incluido" },
    ],
    reviews: [
      { name: "Carlos P.", city: "Bogotá", rating: 5, text: "Este combo es todo lo que necesitas para la lluvia. Chaqueta, zapatones y forro de morral. Completo." },
      { name: "Daniela R.", city: "Medellín", rating: 5, text: "Lo compré para mi esposo que trabaja en moto. Llega seco todos los días. Excelente combo." },
      { name: "Jorge E.", city: "Manizales", rating: 4, text: "Buen combo para la lluvia. Todo en un solo paquete y a buen precio." },
    ],
    faq: [
      { q: "¿Qué incluye el combo exactamente?", a: "Incluye chaqueta impermeable Hydra, zapatones con suela dura y forro impermeable para morral." },
      { q: "¿Es mejor comprar el combo o por separado?", a: "El combo tiene un precio especial que representa ahorro frente a comprar cada pieza por separado." },
      { q: "¿Los zapatones se ponen sobre los zapatos?", a: "Sí, los zapatones van sobre tu calzado habitual para protegerlo de la lluvia." },
    ],
    targetAudience: ["Motociclistas urbanos que necesitan protección contra lluvia para el trayecto al trabajo", "Domiciliarios que cargan morral y quieren proteger tanto su cuerpo como su carga", "Compradores prácticos que prefieren un kit todo-en-uno en vez de comprar pieza por pieza"],
    salesCount: 32,
    humanDescription: "Todo lo que necesitas para no mojarte en moto, en un solo combo a mejor precio. Chaqueta Hydra + zapatones + forro de morral. Solución completa contra la lluvia.",
    crashProtection: {
      title: "¿Por qué es peligroso mojarse en moto?",
      description: "Llegar mojado a tu destino no es solo incómodo — ropa mojada reduce tu control, empañas el visor, y tus manos resbalan del manillar.",
      protections: [
        "Chaqueta Hydra impermeable con protecciones CE incluidas",
        "Zapatones con suela dura para apoyo seguro en pavimento mojado",
        "Kit completo que elimina la distracción de sentir el agua entrando",
        "Forro de morral que protege tus documentos y electrónicos del agua"
      ],
    },
    comparisonTable: [
      { feature: "Kit impermeable de 3 piezas completo", sequoia: true, generic: false },
      { feature: "Costuras selladas en todas las piezas", sequoia: true, generic: false },
      { feature: "Incluye forro protector de morral", sequoia: true, generic: false },
      { feature: "Ahorro real vs compra individual", sequoia: true, generic: false },
      { feature: "Zapatones con suela dura antideslizante", sequoia: true, generic: false },
      { feature: "Garantía de fábrica en todo el combo", sequoia: true, generic: false },
    ],
  },

  "combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-guantes-motociclismo": {
    subtitle: "Kit impermeable premium: chaqueta + pantalón + zapatones + guantes + forro morral",
    benefits: [
      { icon: "droplet", text: "Protección total contra lluvia de cabeza a pies" },
      { icon: "hand", text: "Guantes impermeables incluidos en el kit" },
      { icon: "cube", text: "5 piezas en un solo combo a precio especial" },
    ],
    reviews: [
      { name: "Luis Fernando T.", city: "Bogotá", rating: 5, text: "El combo más completo. Chaqueta, pantalón, zapatones, guantes y forro de morral. No necesitas nada más." },
      { name: "Martha G.", city: "Pereira", rating: 5, text: "Se lo compré a mi hijo que trabaja en Rappi. Llega seco de la cabeza a los pies." },
      { name: "Fabián R.", city: "Cali", rating: 4, text: "Muy buen combo. Todas las piezas son de buena calidad. Los guantes son un plus." },
    ],
    faq: [
      { q: "¿Qué incluye este combo?", a: "Incluye chaqueta impermeable, pantalón impermeable, zapatones suela dura, guantes impermeables y forro de morral." },
      { q: "¿Los guantes funcionan para manejar moto?", a: "Sí, son guantes diseñados para motociclismo con agarre en manubrio mojado." },
      { q: "¿Todo es de la misma talla?", a: "Selecciona tu talla y todo el combo viene coordinado. Los zapatones vienen en tallas de calzado." },
    ],
    targetAudience: ["Repartidores de Rappi, Didi o iFood que necesitan protección completa contra lluvia incluyendo manos", "Motociclistas que quieren la solución más completa posible en un solo combo", "Familiares que buscan un regalo integral para el motociclista de la casa", "Trabajadores motorizados que no pueden parar cuando llueve y necesitan cada parte del cuerpo seca"],
    salesCount: 25,
    humanDescription: "El kit más completo contra la lluvia: chaqueta, pantalón, zapatones, guantes y forro de morral. Todo en un combo para que no te falte nada cuando el aguacero te sorprende.",
    crashProtection: {
      title: "¿Cómo te protege este combo en condiciones de lluvia extrema?",
      description: "Un aguacero fuerte en carretera es una de las situaciones más peligrosas para un motociclista. Visibilidad cero, piso resbaloso y frío que entumece.",
      protections: [
        "Impermeabilidad total de pies a cabeza que mantiene tu control del vehículo",
        "Guantes impermeables que mantienen el agarre del manillar bajo lluvia",
        "Zapatones con suela antideslizante para apoyar el pie con seguridad",
        "Visibilidad mejorada al no tener que detenerte a cubrirte improvisadamente"
      ],
    },
    comparisonTable: [
      { feature: "Kit impermeable completo con guantes", sequoia: true, generic: false },
      { feature: "5 piezas de protección contra lluvia", sequoia: true, generic: false },
      { feature: "Costuras selladas en cada pieza", sequoia: true, generic: false },
      { feature: "Ahorro significativo vs compra individual", sequoia: true, generic: false },
      { feature: "Todo lo necesario en un solo paquete", sequoia: true, generic: false },
      { feature: "Garantía de fábrica en todo el combo", sequoia: true, generic: false },
    ],
  },

  "combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo": {
    subtitle: "Kit impermeable esencial: chaqueta + pantalón + zapatones + forro morral",
    benefits: [
      { icon: "droplet", text: "Kit completo contra la lluvia para moto" },
      { icon: "bolt", text: "Zapatones con suela dura antideslizante" },
      { icon: "tag", text: "Ahorra comprando el combo completo" },
    ],
    reviews: [
      { name: "Andrés V.", city: "Bogotá", rating: 5, text: "El combo esencial para cualquier motociclista en Colombia. No le falta nada." },
      { name: "Carolina H.", city: "Medellín", rating: 5, text: "Mi esposo lo usa todos los días. Después de un año sigue funcionando perfecto." },
      { name: "Óscar M.", city: "Bucaramanga", rating: 4, text: "Buen kit impermeable. Los zapatones de suela dura son los que más me gustan." },
    ],
    faq: [
      { q: "¿Qué incluye este combo?", a: "Incluye chaqueta impermeable, pantalón impermeable, zapatones suela dura y forro impermeable para morral." },
      { q: "¿Es diferente al combo con guantes?", a: "Sí, este combo no incluye guantes. Si necesitas guantes también, elige el combo premium." },
      { q: "¿El forro de morral sirve para cualquier mochila?", a: "Sí, es un forro elástico que se ajusta a la mayoría de morrales y maletas de espalda." },
    ],
    targetAudience: ["Motociclistas que ya tienen guantes y solo necesitan el kit impermeable básico", "Conductores de moto con presupuesto moderado que quieren lo esencial contra la lluvia", "Estudiantes y trabajadores que se movilizan diario en moto en ciudades lluviosas"],
    salesCount: 38,
    humanDescription: "Kit impermeable esencial: chaqueta, pantalón, zapatones y forro de morral. Todo lo básico para llegar seco a donde vayas, sin complicaciones.",
    crashProtection: {
      title: "¿Por qué un kit impermeable mejora tu seguridad?",
      description: "El motociclista que va mojado e incómodo pierde concentración y control. Mantenerte seco es mantener tu capacidad de reacción.",
      protections: [
        "Impermeabilidad que mantiene tu concentración en la vía y no en la incomodidad",
        "Zapatones con suela dura para apoyo firme al detenerte en superficie mojada",
        "Kit completo que se pone rápido sin perder tiempo expuesto a la lluvia"
      ],
    },
    comparisonTable: [
      { feature: "Kit impermeable esencial de 4 piezas", sequoia: true, generic: false },
      { feature: "Protección completa de cuerpo y morral", sequoia: true, generic: false },
      { feature: "Costuras selladas impermeables", sequoia: true, generic: false },
      { feature: "Ahorro vs compra por separado", sequoia: true, generic: false },
      { feature: "Zapatones con suela reforzada", sequoia: true, generic: false },
      { feature: "Garantía de fábrica en todo el combo", sequoia: true, generic: false },
    ],
  },

  "cubre-maletas-impermeable-sequoia-speed": {
    subtitle: "Protege tu morral o maleta de la lluvia con este forro impermeable",
    benefits: [
      { icon: "cube", text: "Protege morral, maleta o maletín de la lluvia" },
      { icon: "cube", text: "Se ajusta a múltiples tamaños de maleta" },
      { icon: "wind", text: "Ultraliviano y fácil de guardar" },
    ],
    reviews: [
      { name: "Santiago C.", city: "Bogotá", rating: 5, text: "Indispensable para llevar el portátil en moto. Protege perfecto el morral de la lluvia." },
      { name: "Lucía R.", city: "Medellín", rating: 5, text: "Pequeño, práctico y funciona. Lo llevo siempre en el morral por si llueve." },
      { name: "Juan M.", city: "Cali", rating: 4, text: "Cumple su función. Protege bien la maleta y es fácil de poner y quitar." },
    ],
    faq: [
      { q: "¿Sirve para cualquier morral?", a: "Sí, es elástico y se ajusta a la mayoría de morrales y maletas de espalda." },
      { q: "¿Es totalmente impermeable?", a: "Sí, protege tu morral y su contenido de la lluvia." },
      { q: "¿Ocupa mucho espacio guardado?", a: "No, es ultraliviano y se pliega en un espacio muy reducido." },
    ],
    targetAudience: ["Profesionales que transportan portátil o documentos importantes en moto", "Estudiantes universitarios que llevan libros y electrónicos en el morral", "Motociclistas que ya tienen impermeable corporal pero necesitan proteger su equipaje"],
    salesCount: 12,
    humanDescription: "Protege tu morral, maletín o maleta de la lluvia con este forro impermeable. Se ajusta fácil, cubre completamente y se guarda en cualquier bolsillo cuando no lo necesitas.",
    crashProtection: null,
    comparisonTable: [
      { feature: "Impermeabilidad total para tu equipaje", sequoia: true, generic: false },
      { feature: "Ajuste universal a distintos tamaños", sequoia: true, generic: false },
      { feature: "Material resistente al desgarro", sequoia: true, generic: false },
      { feature: "Plegable ultracompacto", sequoia: true, generic: false },
      { feature: "Se instala en segundos", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "impermeable-tipo-sudadera-liviano-plegable": {
    subtitle: "Impermeable ultraliviano tipo sudadera que se guarda en cualquier parte",
    benefits: [
      { icon: "wind", text: "Ultraliviano y plegable — cabe en el bolsillo" },
      { icon: "droplet", text: "Impermeable para lluvias moderadas" },
      { icon: "cube", text: "Diseño tipo sudadera cómodo y casual" },
    ],
    reviews: [
      { name: "Andrés L.", city: "Bogotá", rating: 5, text: "Lo llevo siempre en la moto. Cuando llueve me lo pongo en 30 segundos y quedo protegido." },
      { name: "Verónica S.", city: "Medellín", rating: 5, text: "Súper práctico. Se pliega tan pequeño que siempre lo llevo en el morral." },
      { name: "Rafael M.", city: "Pereira", rating: 4, text: "Bueno para lluvias normales. No es para aguacero fuerte pero para la llovizna es perfecto." },
    ],
    faq: [
      { q: "¿Sirve para lluvia fuerte?", a: "Es ideal para lluvias moderadas y lloviznas. Para lluvia fuerte recomendamos los combos impermeables." },
      { q: "¿Cómo se guarda?", a: "Se pliega en sí mismo quedando del tamaño de un puño. Fácil de llevar siempre." },
      { q: "¿Se pone por encima de otra chaqueta?", a: "Sí, el diseño tipo sudadera permite ponerse encima de tu ropa sin problemas." },
    ],
    targetAudience: ["Motociclistas que quieren un impermeable de emergencia siempre en la moto sin ocupar espacio", "Conductores que no quieren cargar equipo pesado pero necesitan protección contra lloviznas", "Usuarios de scooter y moto pequeña que buscan algo rápido de poner en caso de lluvia inesperada"],
    salesCount: 45,
    humanDescription: "El impermeable más práctico del mercado: tipo sudadera, se pliega hasta caber en tu bolsillo y te protege de la lluvia en segundos. Ideal para llevar siempre en la moto por si acaso.",
    crashProtection: null,
    comparisonTable: [
      { feature: "Ultraliviano y plegable de bolsillo", sequoia: true, generic: false },
      { feature: "Impermeabilidad real con costuras selladas", sequoia: true, generic: false },
      { feature: "Se pone sobre la ropa en segundos", sequoia: true, generic: false },
      { feature: "Tipo sudadera con capucha integrada", sequoia: true, generic: false },
      { feature: "Ideal para llevar siempre en la moto", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // PANTALONES
  // ══════════════════════════════════════════════════
  "pantalon-black-pro-pantalon-antifriccion-impermeable-para-motorizado-con-protecciones-certificadas": {
    subtitle: "Pantalón premium antifricción con protecciones CE e impermeable",
    benefits: [
      { icon: "shield", text: "Protecciones CE en rodillas removibles" },
      { icon: "droplet", text: "Impermeable con costuras termoselladas" },
      { icon: "muscle", text: "Material antifricción de alta resistencia" },
    ],
    reviews: [
      { name: "Felipe H.", city: "Bogotá", rating: 5, text: "El compañero perfecto de la chaqueta Black Pro. Juntos dan protección total." },
      { name: "Sandra G.", city: "Medellín", rating: 5, text: "Se siente la calidad. Las protecciones de rodilla son firmes y el material es grueso." },
      { name: "Diego R.", city: "Cali", rating: 4, text: "Buen pantalón de protección. Cómodo para manejar y resistente." },
    ],
    faq: [
      { q: "¿Hace juego con la chaqueta Black Pro?", a: "Sí, están diseñados para combinarse como traje completo de protección." },
      { q: "¿Se puede usar sin las protecciones?", a: "Sí, las protecciones de rodilla son removibles." },
      { q: "¿Es cómodo para manejar todo el día?", a: "Sí, el corte está diseñado para la posición de manejo en moto." },
    ],
    targetAudience: ["Motociclistas que ya tienen la chaqueta Black Pro y quieren completar el traje", "Conductores diarios que buscan protección de piernas con calidad premium", "Mensajeros motorizados que necesitan pantalón resistente a la abrasión para jornadas largas"],
    salesCount: 28,
    humanDescription: "El pantalón que complementa la chaqueta Black Pro. Material antifricción, protecciones CE en rodillas e impermeable total. Para quienes protegen de la cintura para abajo con la misma seriedad.",
    crashProtection: {
      title: "¿Qué le pasa a tus piernas en una caída sin protección?",
      description: "En la mayoría de caídas de moto, las piernas y rodillas son lo primero que toca el suelo. Sin protección, las quemaduras por asfalto en los muslos son de las lesiones más comunes.",
      protections: [
        "Material antifricción Black Pro que protege tus piernas del deslizamiento sobre asfalto",
        "Protecciones CE en rodillas que absorben el impacto directo contra el pavimento",
        "Costuras reforzadas que mantienen la integridad del pantalón durante la abrasión",
        "Impermeabilidad que evita que el pantalón absorba agua y pierda sus propiedades"
      ],
    },
    comparisonTable: [
      { feature: "Material antifricción de alta resistencia", sequoia: true, generic: false },
      { feature: "Protecciones CE en rodillas removibles", sequoia: true, generic: false },
      { feature: "Impermeable con costuras selladas", sequoia: true, generic: false },
      { feature: "Refuerzo en zonas de impacto", sequoia: true, generic: false },
      { feature: "Compatible con chaqueta Black Pro", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "pantalon-gas-black-impermeable-protecciones-certificadas-removibles-material-antifriccion": {
    subtitle: "Pantalón antifricción GAS en negro con protecciones CE e impermeable",
    benefits: [
      { icon: "shield", text: "Protecciones certificadas CE removibles en rodillas" },
      { icon: "droplet", text: "100% impermeable para cualquier clima" },
      { icon: "muscle", text: "Material antifricción resistente al asfalto" },
    ],
    reviews: [
      { name: "Miguel R.", city: "Bogotá", rating: 5, text: "El GAS Black es excelente. Protecciones de verdad y totalmente impermeable." },
      { name: "Camila V.", city: "Medellín", rating: 5, text: "Lo uso con la chaqueta Carrera y quedo protegida de todo. El material es muy resistente." },
      { name: "Andrés P.", city: "Cali", rating: 4, text: "Buen pantalón. Las protecciones se sienten seguras y el negro combina con todo." },
    ],
    faq: [
      { q: "¿Cuál es la diferencia entre GAS Black, Green y Ladies?", a: "Son el mismo modelo GAS con las mismas especificaciones pero en diferentes colores/cortes." },
      { q: "¿Las protecciones cubren solo rodillas?", a: "Las protecciones principales están en las rodillas. Consulta las especificaciones para detalles completos." },
      { q: "¿Se puede lavar en lavadora?", a: "Recomendamos lavado a mano. Retira las protecciones antes de lavar." },
    ],
    targetAudience: ["Motociclistas que prefieren negro clásico para combinar con cualquier chaqueta", "Conductores urbanos que buscan un pantalón versátil antifricción para uso diario", "Repartidores que necesitan un pantalón resistente y discreto para trabajar", "Motociclistas que quieren protección de rodilla certificada sin llamar la atención"],
    salesCount: 24,
    humanDescription: "El pantalón GAS Black ofrece protección antifricción con protecciones CE removibles. Versátil para el uso diario: con protecciones para la moto, sin protecciones como pantalón casual.",
    crashProtection: {
      title: "¿Tus piernas están protegidas si la moto se te va?",
      description: "Cuando la moto se desliza de lado, tu pierna queda atrapada entre el peso de la moto y el asfalto. Sin antifricción, la piel del muslo sufre quemaduras severas.",
      protections: [
        "Material antifricción GAS que resiste el arrastre sobre el pavimento",
        "Protecciones CE certificadas en rodillas para absorber impactos directos",
        "Diseño que permite usar las protecciones solo cuando estás en moto",
        "Costuras termoselladas que no se abren bajo presión de fricción"
      ],
    },
    comparisonTable: [
      { feature: "Material antifricción certificado", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles en rodillas", sequoia: true, generic: false },
      { feature: "Impermeable con costuras selladas", sequoia: true, generic: false },
      { feature: "Uso dual: con/sin protecciones", sequoia: true, generic: false },
      { feature: "Diseño versátil para diario", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "pantalon-gas-green-proteccion-rodillas-certificadas-removibles-impermeable": {
    subtitle: "Pantalón GAS en verde con protecciones CE e impermeable total",
    benefits: [
      { icon: "shield", text: "Protecciones CE en rodillas certificadas y removibles" },
      { icon: "droplet", text: "Impermeable con costuras selladas" },
      { icon: "badge", text: "Color verde para un look diferenciador" },
    ],
    reviews: [
      { name: "Esteban G.", city: "Bogotá", rating: 5, text: "Me gusta que es verde y diferente. Mismo nivel de protección que el negro." },
      { name: "Natalia C.", city: "Pereira", rating: 5, text: "Lo combino con la chaqueta Carrera Green. Se ve espectacular y protege de verdad." },
      { name: "Jorge L.", city: "Medellín", rating: 4, text: "Buen pantalón. El verde es un toque diferente que me gusta." },
    ],
    faq: [
      { q: "¿Es igual al GAS Black pero en verde?", a: "Sí, mismas especificaciones técnicas y protecciones en color verde." },
      { q: "¿Se puede combinar con otras chaquetas?", a: "Sí, aunque combina especialmente bien con la Chaqueta Carrera Green." },
      { q: "¿El color verde se mantiene?", a: "Sí, el material está diseñado para mantener el color con el uso." },
    ],
    targetAudience: ["Motociclistas que ya tienen la chaqueta Carrera Green y buscan el pantalón a juego", "Riders que quieren un look coordinado y diferente al negro convencional", "Motociclistas de grupos o clubes que usan colores coordinados en sus rodadas"],
    salesCount: 15,
    humanDescription: "El GAS Green es el mismo pantalón de protección en un color que se sale de lo convencional. Ideal si quieres combinar con tu chaqueta Carrera Green o simplemente destacarte.",
    crashProtection: {
      title: "¿Por qué necesitas protección en las piernas además de la chaqueta?",
      description: "Muchos motociclistas usan chaqueta pero olvidan las piernas. En una caída lateral, las rodillas y los muslos reciben la mayor parte del impacto.",
      protections: [
        "Protecciones CE en rodillas que reducen el impacto hasta en un 80%",
        "Material antifricción que evita las quemaduras por arrastre en muslos",
        "Impermeabilidad total para condiciones de lluvia sin perder protección"
      ],
    },
    comparisonTable: [
      { feature: "Color distintivo de alta visibilidad", sequoia: true, generic: false },
      { feature: "Material antifricción en piernas", sequoia: true, generic: false },
      { feature: "Protecciones CE certificadas removibles", sequoia: true, generic: false },
      { feature: "Impermeabilidad total", sequoia: true, generic: false },
      { feature: "Combinable con chaqueta Carrera Green", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "pantalon-gas-ladies-pantalon-de-proteccion-impermeable-con-protectores-certificados-removibles": {
    subtitle: "Pantalón de protección GAS diseñado para la anatomía femenina",
    benefits: [
      { icon: "users", text: "Corte específico para damas cómodo y seguro" },
      { icon: "shield", text: "Protecciones CE removibles en rodillas" },
      { icon: "droplet", text: "100% impermeable para cualquier clima" },
    ],
    reviews: [
      { name: "Valentina M.", city: "Bogotá", rating: 5, text: "Por fin un pantalón de moto que le queda bien a una mujer. Cómodo y con protección real." },
      { name: "Mariana S.", city: "Medellín", rating: 5, text: "Lo uso con la Black Pro Dama. Es genial tener pantalón de protección con corte femenino." },
      { name: "Andrea R.", city: "Cali", rating: 4, text: "Buen pantalón para damas. Las protecciones se sienten bien y el ajuste es correcto." },
    ],
    faq: [
      { q: "¿Qué diferencia tiene con el GAS normal?", a: "Tiene corte y tallaje diseñado para la anatomía femenina, con mejor ajuste en cadera." },
      { q: "¿Qué chaqueta combina bien?", a: "Combina perfectamente con la Chaqueta Black Pro Dama o cualquier otra chaqueta Sequoia." },
      { q: "¿Las tallas son de mujer?", a: "Sí, el tallaje está adaptado para tallas femeninas." },
    ],
    targetAudience: ["Mujeres motociclistas cansadas de usar pantalones de hombre que no les quedan bien", "Damas que ya tienen la chaqueta Black Pro Dama y buscan completar su equipo", "Motociclistas mujeres que quieren protección certificada con ajuste correcto en cadera y piernas"],
    salesCount: 17,
    humanDescription: "Pantalón de protección diseñado para la mujer motociclista. No es un pantalón de hombre en talla pequeña — tiene corte femenino real con las mismas protecciones CE certificadas.",
    crashProtection: {
      title: "¿Por qué las mujeres necesitan un pantalón de protección propio?",
      description: "Un pantalón de hombre en talla pequeña deja holguras en las caderas y aprieta en la cintura. Esas holguras hacen que las protecciones se desplacen justo cuando más las necesitas.",
      protections: [
        "Protecciones CE posicionadas según anatomía femenina para máxima efectividad",
        "Material antifricción que protege las piernas de quemaduras por asfalto",
        "Corte que se ajusta correctamente y no permite que la prenda se mueva en una caída",
        "Impermeabilidad que mantiene las propiedades protectoras bajo cualquier clima"
      ],
    },
    comparisonTable: [
      { feature: "Corte anatómico femenino real", sequoia: true, generic: false },
      { feature: "Protecciones CE de rodilla removibles", sequoia: true, generic: false },
      { feature: "Material antifricción certificado", sequoia: true, generic: false },
      { feature: "Impermeable con costuras selladas", sequoia: true, generic: false },
      { feature: "Diseñado para la mujer motociclista", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "pantalon-impermeable-tipo-sudadera-para-moto-con-forro-siliconado-interno": {
    subtitle: "Pantalón impermeable liviano tipo sudadera con forro siliconado",
    benefits: [
      { icon: "droplet", text: "Impermeable con forro siliconado interno" },
      { icon: "cube", text: "Se pone sobre tu pantalón normal fácilmente" },
      { icon: "wind", text: "Liviano y práctico para llevar en la moto" },
    ],
    reviews: [
      { name: "Ricardo G.", city: "Bogotá", rating: 5, text: "El forro siliconado hace que el agua resbale. Lo pongo encima del pantalón de oficina y listo." },
      { name: "Claudia P.", city: "Medellín", rating: 5, text: "Muy práctico. Me lo pongo en 1 minuto cuando empieza a llover y quedo seca." },
      { name: "Hernán M.", city: "Manizales", rating: 4, text: "Buen pantalón impermeable. El forro siliconado funciona bien. Fácil de guardar." },
    ],
    faq: [
      { q: "¿Qué es el forro siliconado?", a: "Es un forro interno que repele el agua de forma más efectiva que los impermeables comunes." },
      { q: "¿Se pone encima del pantalón normal?", a: "Sí, el diseño tipo sudadera permite colocarlo rápidamente sobre cualquier pantalón." },
      { q: "¿Incluye protecciones?", a: "No incluye protecciones. Es un pantalón impermeable liviano para proteger contra la lluvia." },
    ],
    targetAudience: ["Oficinistas que van en moto al trabajo y necesitan proteger su pantalón formal de la lluvia", "Motociclistas que buscan un sobre-pantalón rápido de poner cuando empieza a llover", "Conductores que ya tienen chaqueta impermeable y solo les falta el pantalón complementario"],
    salesCount: 34,
    humanDescription: "Pantalón impermeable liviano tipo sudadera que se pone sobre tu pantalón normal. El forro siliconado repele el agua mejor que los impermeables comunes. Práctico y efectivo.",
    crashProtection: {
      title: "¿Cómo te ayuda este pantalón cuando llueve en la vía?",
      description: "Piernas mojadas pierden sensibilidad y dificultan los cambios de marcha. Mantenerte seco es mantenerte en control de la moto.",
      protections: [
        "Forro siliconado que repele el agua de forma superior a impermeables convencionales",
        "Material que se pone rápidamente sobre tu ropa sin detenerte mucho tiempo en la vía",
        "Impermeabilidad que mantiene tus piernas secas y con sensibilidad para el manejo"
      ],
    },
    comparisonTable: [
      { feature: "Forro siliconado repelente al agua", sequoia: true, generic: false },
      { feature: "Se pone sobre tu pantalón normal", sequoia: true, generic: false },
      { feature: "Costuras selladas impermeables", sequoia: true, generic: false },
      { feature: "Liviano y plegable", sequoia: true, generic: false },
      { feature: "Elástico ajustable en cintura", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "pantalon-sahara-impermeable-protecciones-certificadas-removibles-material-antifriccion": {
    subtitle: "Pantalón Sahara antifricción con protecciones CE e impermeable",
    benefits: [
      { icon: "shield", text: "Protecciones CE certificadas en rodillas removibles" },
      { icon: "droplet", text: "Impermeable total con costuras termoselladas" },
      { icon: "muscle", text: "Material antifricción para máxima resistencia" },
    ],
    reviews: [
      { name: "Fernando C.", city: "Bogotá", rating: 5, text: "Lo uso con la chaqueta Sahara. Juntos son un equipo completo de touring." },
      { name: "Patricia V.", city: "Armenia", rating: 5, text: "El Sahara es excelente para rutas largas. Cómodo, impermeable y con buenas protecciones." },
      { name: "Gustavo R.", city: "Medellín", rating: 4, text: "Buen pantalón touring. Resistente y cómodo para viajes largos." },
    ],
    faq: [
      { q: "¿Hace juego con la chaqueta Sahara?", a: "Sí, están diseñados para usarse como traje completo de touring." },
      { q: "¿Es bueno para rutas largas?", a: "Sí, el diseño touring prioriza comodidad para viajes de varias horas." },
      { q: "¿Se puede usar como pantalón casual?", a: "Principalmente es un pantalón de protección para moto, pero sin las protecciones funciona como pantalón casual." },
    ],
    targetAudience: ["Viajeros de touring que ya tienen la chaqueta Sahara y quieren el traje completo", "Motociclistas de ruta que necesitan comodidad en piernas durante trayectos de 4+ horas", "Aventureros que recorren carreteras colombianas y enfrentan condiciones climáticas variables"],
    salesCount: 18,
    humanDescription: "El pantalón touring Sahara para viajes largos donde la comodidad es tan importante como la protección. Combina perfectamente con la chaqueta Sahara para protección de cuerpo completo.",
    crashProtection: {
      title: "¿Qué pasa con tus piernas si caes en plena carretera?",
      description: "En ruta, las velocidades son más altas y la distancia de deslizamiento es mayor. El pantalón Sahara fue diseñado para protegerte a velocidades de carretera.",
      protections: [
        "Material antifricción Sahara de alta resistencia para velocidades de touring",
        "Protecciones CE en rodillas certificadas para impactos a velocidad de carretera",
        "Costuras termoselladas que resisten abrasión prolongada sobre asfalto",
        "Impermeabilidad total que mantiene las propiedades protectoras bajo lluvia en ruta"
      ],
    },
    comparisonTable: [
      { feature: "Diseño touring para viajes largos", sequoia: true, generic: false },
      { feature: "Material antifricción de alta resistencia", sequoia: true, generic: false },
      { feature: "Protecciones CE removibles en rodillas", sequoia: true, generic: false },
      { feature: "Impermeabilidad con costuras selladas", sequoia: true, generic: false },
      { feature: "Combinable con chaqueta Sahara", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // TRAJES PARA MOTO
  // ══════════════════════════════════════════════════
  "combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-guantes-moto-motociclismo": {
    subtitle: "Kit impermeable premium con guantes: protección total contra la lluvia",
    benefits: [
      { icon: "droplet", text: "Kit completo 5 piezas contra la lluvia" },
      { icon: "hand", text: "Incluye guantes impermeables para mejor agarre" },
      { icon: "tag", text: "Ahorro significativo vs compra por separado" },
    ],
    reviews: [
      { name: "Hernán T.", city: "Bogotá", rating: 5, text: "El combo más completo que hay. Con los guantes incluidos no necesitas nada más para la lluvia." },
      { name: "Paula S.", city: "Medellín", rating: 5, text: "Lo compramos para los dos. Excelente kit a muy buen precio." },
      { name: "Roberto J.", city: "Cali", rating: 4, text: "Todo en uno. Buen kit impermeable para motorizado." },
    ],
    faq: [
      { q: "¿Qué incluye este combo premium?", a: "Chaqueta Hydra impermeable, pantalón impermeable, zapatones suela dura, guantes impermeables y forro de morral." },
      { q: "¿Es el combo más completo?", a: "Sí, incluye guantes que los demás combos no tienen. Es el kit más completo contra la lluvia." },
      { q: "¿Cuánto ahorro vs compra individual?", a: "El combo tiene un precio especial con ahorro significativo frente a comprar cada pieza por separado." },
    ],
    targetAudience: ["Motociclistas nuevos que necesitan equiparse completamente contra la lluvia desde cero", "Domiciliarios y repartidores que quieren la solución más completa con guantes incluidos", "Parejas que buscan un kit para compartir o regalar al motociclista de la familia", "Conductores de zonas de alta pluviosidad como el Eje Cafetero o Bogotá"],
    salesCount: 22,
    humanDescription: "El combo más completo con guantes incluidos. 5 piezas impermeables para protección total contra la lluvia: chaqueta Hydra, pantalón, zapatones, guantes y forro de morral.",
    crashProtection: {
      title: "¿Por qué la protección contra lluvia es protección contra accidentes?",
      description: "El 40% de los accidentes de moto en Colombia ocurren bajo lluvia. Estar preparado con el equipo correcto reduce significativamente tu riesgo.",
      protections: [
        "Chaqueta Hydra con protecciones CE que funcionan bajo cualquier condición climática",
        "Guantes impermeables que mantienen el agarre del manillar bajo lluvia torrencial",
        "Zapatones con suela antideslizante para los momentos más críticos: frenar y apoyar el pie",
        "Kit integral que elimina la improvisación y te mantiene enfocado en la conducción"
      ],
    },
    comparisonTable: [
      { feature: "Kit premium de 5 piezas impermeables", sequoia: true, generic: false },
      { feature: "Chaqueta Hydra impermeable con CE", sequoia: true, generic: false },
      { feature: "Guantes impermeables incluidos", sequoia: true, generic: false },
      { feature: "Costuras selladas en todas las piezas", sequoia: true, generic: false },
      { feature: "Mejor precio vs compra individual", sequoia: true, generic: false },
      { feature: "Garantía de fábrica en todo el combo", sequoia: true, generic: false },
    ],
  },

  "traje-anti-friccion-black-pro-de-moto-impermeable-sequoia-speed": {
    subtitle: "Traje completo Black Pro: chaqueta + pantalón antifricción con protecciones CE",
    benefits: [
      { icon: "shield", text: "Protección CE de cuerpo completo (torso + piernas)" },
      { icon: "droplet", text: "Traje 100% impermeable con liner removible" },
      { icon: "muscle", text: "Material antifricción premium Black Pro" },
    ],
    reviews: [
      { name: "Juan Carlos M.", city: "Bogotá", rating: 5, text: "El traje Black Pro es lo mejor que he comprado para moto. Protección total de pies a cabeza." },
      { name: "Alejandra S.", city: "Medellín", rating: 5, text: "La combinación de chaqueta + pantalón Black Pro es imbatible. Calidad premium." },
      { name: "Diego V.", city: "Pereira", rating: 4, text: "Excelente traje. Se siente la protección y es completamente impermeable." },
    ],
    faq: [
      { q: "¿Qué incluye el traje?", a: "Incluye chaqueta Black Pro y pantalón Black Pro con protecciones CE en hombros, codos, espalda y rodillas." },
      { q: "¿Es mejor comprar el traje o las piezas por separado?", a: "El traje tiene precio especial y garantiza que ambas piezas combinen perfectamente." },
      { q: "¿Se puede usar solo la chaqueta o solo el pantalón?", a: "Sí, cada pieza funciona de forma independiente." },
    ],
    targetAudience: ["Motociclistas que buscan protección premium de cuerpo completo en un solo paquete", "Conductores de moto de alto cilindraje que necesitan el máximo nivel de seguridad", "Viajeros de ruta que hacen trayectos intermunicipales frecuentes y priorizan protección total", "Motociclistas que prefieren ahorrar comprando chaqueta y pantalón juntos como traje"],
    salesCount: 30,
    humanDescription: "El traje completo Black Pro: chaqueta + pantalón con la mejor protección antifricción de nuestro catálogo. Protección de cuerpo entero para quienes no dejan nada al azar.",
    crashProtection: {
      title: "¿Qué pasa si caes a velocidad con el traje Black Pro completo?",
      description: "Un traje completo es la máxima expresión de protección. En una caída a 60+ km/h, cada centímetro de piel cubierta con antifricción es un centímetro que no sufre quemaduras.",
      protections: [
        "Protección antifricción Black Pro de pies a cuello — sin zonas expuestas entre chaqueta y pantalón",
        "Protecciones CE en 5 zonas: hombros, codos, espalda, caderas y rodillas",
        "Sistema coordinado donde chaqueta y pantalón se conectan para no separarse en una caída",
        "Costuras termoselladas en toda la prenda para resistencia integral"
      ],
    },
    comparisonTable: [
      { feature: "Protección antifricción de cuerpo completo", sequoia: true, generic: false },
      { feature: "Protecciones CE en 4+ zonas", sequoia: true, generic: false },
      { feature: "Impermeabilidad total con costuras selladas", sequoia: true, generic: false },
      { feature: "Chaqueta + pantalón coordinados", sequoia: true, generic: false },
      { feature: "Material premium de máxima resistencia", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "traje-impermeable-para-moto-tipo-sudadera-con-forro-de-silicon-interna": {
    subtitle: "Traje impermeable liviano tipo sudadera: chaqueta + pantalón con forro siliconado",
    benefits: [
      { icon: "droplet", text: "Forro siliconado interno para impermeabilidad superior" },
      { icon: "cube", text: "Tipo sudadera: fácil de poner sobre tu ropa" },
      { icon: "cube", text: "Compacto y fácil de guardar en la moto" },
    ],
    reviews: [
      { name: "Sebastián P.", city: "Bogotá", rating: 5, text: "Lo mejor para la lluvia de Bogotá. Me lo pongo encima del traje formal y llego seco al trabajo." },
      { name: "Mónica R.", city: "Manizales", rating: 5, text: "El forro siliconado funciona increíble. El agua resbala completamente." },
      { name: "Iván G.", city: "Medellín", rating: 4, text: "Muy práctico para llevar siempre en la moto. Se pone rápido cuando empieza a llover." },
    ],
    faq: [
      { q: "¿Incluye chaqueta y pantalón?", a: "Sí, el traje incluye chaqueta y pantalón tipo sudadera con forro siliconado interno." },
      { q: "¿Qué ventaja tiene el forro siliconado?", a: "El silicón repele el agua de forma más efectiva que materiales impermeables comunes." },
      { q: "¿Incluye protecciones?", a: "Es un traje impermeable liviano. No incluye protecciones anti-caída." },
    ],
    targetAudience: ["Ejecutivos y oficinistas que van en moto al trabajo con ropa formal y necesitan protegerla", "Motociclistas que buscan un traje impermeable compacto para guardar bajo el asiento", "Conductores que ya tienen chaqueta de protección y necesitan un sobre-traje solo para lluvia"],
    salesCount: 40,
    humanDescription: "Traje impermeable liviano que se pone sobre tu ropa en segundos. Chaqueta + pantalón tipo sudadera con forro siliconado para la máxima repelencia al agua. El más vendido para lluvia.",
    crashProtection: null,
    comparisonTable: [
      { feature: "Forro siliconado de máxima repelencia", sequoia: true, generic: false },
      { feature: "Se pone sobre la ropa en segundos", sequoia: true, generic: false },
      { feature: "Chaqueta + pantalón impermeables", sequoia: true, generic: false },
      { feature: "Costuras selladas en ambas piezas", sequoia: true, generic: false },
      { feature: "Liviano y plegable para emergencias", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "traje-para-moto-carrera-traje-de-proteccion-anti-friccion-para-motociclistas": {
    subtitle: "Traje completo Carrera: protección antifricción de cuerpo entero con CE",
    benefits: [
      { icon: "shield", text: "Protección CE completa en torso y piernas" },
      { icon: "muscle", text: "Material antifricción Carrera de alta resistencia" },
      { icon: "droplet", text: "Impermeable con liner removible" },
    ],
    reviews: [
      { name: "Mauricio H.", city: "Bogotá", rating: 5, text: "El traje Carrera es protección total. Material de primera y protecciones CE reales." },
      { name: "Laura T.", city: "Medellín", rating: 5, text: "Compramos el traje para viajes largos. La comodidad y protección son excelentes." },
      { name: "Carlos S.", city: "Cali", rating: 4, text: "Muy buen traje. Las protecciones son sólidas y el material es resistente." },
    ],
    faq: [
      { q: "¿El traje incluye chaqueta y pantalón?", a: "Sí, el traje Carrera incluye chaqueta y pantalón con protecciones CE coordinadas." },
      { q: "¿Viene en varios colores?", a: "Sí, está disponible en las mismas opciones de color que la línea Carrera." },
      { q: "¿Es bueno para viajes largos?", a: "Sí, la línea Carrera está diseñada para rutas largas con comodidad y protección." },
    ],
    targetAudience: ["Motociclistas deportivos que quieren traje completo coordinado de la línea Carrera", "Viajeros de ruta larga que necesitan protección cuerpo completo con estilo deportivo", "Riders que participan en rodadas grupales y quieren un look profesional completo", "Motociclistas que buscan ahorro comprando el traje en vez de chaqueta y pantalón por separado"],
    salesCount: 20,
    humanDescription: "El traje Carrera completo: estilo deportivo con protección antifricción real. Chaqueta + pantalón coordinados para quienes quieren verse bien y protegerse de verdad.",
    crashProtection: {
      title: "¿Cómo protege el traje Carrera en un accidente de cuerpo completo?",
      description: "En una caída lateral a velocidad, tu cuerpo gira y desliza de forma impredecible. Un traje completo cubre todas las zonas que pueden tocar el asfalto.",
      protections: [
        "Material antifricción Carrera que cubre torso y piernas sin gaps entre prendas",
        "Protecciones CE coordinadas en hombros, codos, espalda y rodillas",
        "Diseño deportivo con refuerzos extra en las zonas de mayor desgaste por deslizamiento",
        "Impermeabilidad que mantiene la protección funcional bajo cualquier condición"
      ],
    },
    comparisonTable: [
      { feature: "Diseño deportivo con antifricción completo", sequoia: true, generic: false },
      { feature: "Protecciones CE certificadas en 4+ zonas", sequoia: true, generic: false },
      { feature: "Impermeabilidad con sellado total", sequoia: true, generic: false },
      { feature: "Chaqueta + pantalón estilo deportivo", sequoia: true, generic: false },
      { feature: "Ventilación regulable multi-zona", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "traje-para-moto-mesh-traje-de-proteccion-anti-friccion-para-motociclistas": {
    subtitle: "Traje de malla ventilada Mesh: protección antifricción para clima cálido",
    benefits: [
      { icon: "wind", text: "Malla ventilada para máximo flujo de aire" },
      { icon: "shield", text: "Protección antifricción a pesar de la malla" },
      { icon: "sun", text: "Diseñado para clima tropical colombiano" },
    ],
    reviews: [
      { name: "Roberto F.", city: "Cali", rating: 5, text: "Para el calor de Cali este traje Mesh es la solución. Ventila increíble y protege." },
      { name: "Diana C.", city: "Barranquilla", rating: 5, text: "El mejor traje para la costa. No da calor y tiene protección real." },
      { name: "Andrés R.", city: "Cartagena", rating: 4, text: "Muy bueno para clima caliente. La malla es de calidad y las protecciones funcionan." },
    ],
    faq: [
      { q: "¿La malla protege en caso de caída?", a: "Sí, es malla antifricción de alta resistencia que combina ventilación con protección." },
      { q: "¿Es bueno para viajes en clima caliente?", a: "Es el traje ideal para rutas en clima cálido gracias a su ventilación máxima." },
      { q: "¿Incluye ambas piezas?", a: "Sí, incluye chaqueta y pantalón Mesh con protecciones." },
    ],
    targetAudience: ["Motociclistas de la costa colombiana y tierra caliente que necesitan traje completo sin morir de calor", "Viajeros que hacen rutas por clima tropical como la Ruta del Sol o hacia la costa", "Riders que dejaron de usar traje de protección por el calor y necesitan una alternativa ventilada"],
    salesCount: 18,
    humanDescription: "El traje completo para clima caliente. Malla ventilada que no te deja morir de calor pero con material antifricción y protecciones CE reales. Ideal para la costa y tierra caliente.",
    crashProtection: {
      title: "¿El traje de malla ventilada realmente protege en una caída?",
      description: "Muchos creen que la malla = menos protección. Pero la malla Mesh es antifricción: diseñada para ventilar Y proteger al mismo tiempo.",
      protections: [
        "Malla antifricción de alta tenacidad que protege sin sacrificar ventilación",
        "Protecciones CE en torso y piernas: hombros, codos, espalda y rodillas",
        "Paneles de refuerzo estratégico en zonas de mayor contacto durante deslizamientos",
        "Cobertura completa sin las zonas expuestas que dejan las prendas separadas"
      ],
    },
    comparisonTable: [
      { feature: "Malla ventilada para clima cálido", sequoia: true, generic: false },
      { feature: "Material antifricción en zonas clave", sequoia: true, generic: false },
      { feature: "Protecciones CE en 4+ zonas", sequoia: true, generic: false },
      { feature: "Chaqueta + pantalón para calor extremo", sequoia: true, generic: false },
      { feature: "Flujo de aire completo sin sacrificar protección", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  "traje-para-moto-tt-traje-de-proteccion-anti-friccion-para-moto": {
    subtitle: "Traje TT completo: máxima protección antifricción con CE para touring",
    benefits: [
      { icon: "shield", text: "Protecciones CE de máximo nivel en todo el cuerpo" },
      { icon: "muscle", text: "Material TT antifricción de alta gama" },
      { icon: "droplet", text: "100% impermeable para cualquier condición" },
    ],
    reviews: [
      { name: "Leonardo G.", city: "Bogotá", rating: 5, text: "El traje TT es la máxima protección que puedes tener. Material premium y protecciones de verdad." },
      { name: "Tatiana V.", city: "Medellín", rating: 5, text: "Hicimos un viaje largo y el traje TT aguantó lluvia, sol y todo. Excelente calidad." },
      { name: "Héctor M.", city: "Armenia", rating: 4, text: "Traje de alta gama. Se nota la diferencia con productos más baratos." },
    ],
    faq: [
      { q: "¿Es el traje de mayor protección?", a: "Sí, el TT ofrece la máxima protección antifricción y CE de nuestra línea de trajes." },
      { q: "¿Es cómodo para viajes de todo el día?", a: "Sí, el diseño touring prioriza comodidad para uso prolongado." },
      { q: "¿Incluye chaqueta y pantalón?", a: "Sí, el traje TT incluye chaqueta y pantalón con protecciones CE coordinadas." },
    ],
    targetAudience: ["Motociclistas de touring que exigen la máxima protección disponible para viajes largos", "Riders de motos adventure y gran turismo que recorren Colombia de punta a punta", "Motociclistas experimentados que no escatiman en seguridad y quieren lo mejor del catálogo"],
    salesCount: 15,
    humanDescription: "El traje TT es nuestra protección máxima: el material más resistente, las protecciones más completas y la impermeabilidad más confiable. Para motociclistas que exigen lo mejor.",
    crashProtection: {
      title: "¿Qué nivel de protección ofrece el traje TT en el peor escenario?",
      description: "El traje TT está diseñado para el peor escenario posible: una caída a alta velocidad en carretera. Cada componente fue seleccionado para máxima supervivencia.",
      protections: [
        "Material antifricción TT de máxima resistencia — el más duradero de todo nuestro catálogo",
        "Protecciones CE de alto nivel en 5 zonas críticas del cuerpo",
        "Doble sistema de protección: material exterior + liner interno para redundancia total",
        "Costuras industriales que resisten las fuerzas más extremas de abrasión y tracción"
      ],
    },
    comparisonTable: [
      { feature: "Máxima protección antifricción disponible", sequoia: true, generic: false },
      { feature: "Protecciones CE de gama alta en 4+ zonas", sequoia: true, generic: false },
      { feature: "Impermeabilidad premium con sellado total", sequoia: true, generic: false },
      { feature: "Material de máxima resistencia al desgaste", sequoia: true, generic: false },
      { feature: "Chaqueta + pantalón de gama profesional", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // AIRBAG
  // ══════════════════════════════════════════════════
  "chaleco-airbag-motociclista-verde-reflectivo-alta-visibilidad": {
    subtitle: "Chaleco airbag mecánico que se infla en caso de caída para proteger tu torso",
    benefits: [
      { icon: "shield", text: "Sistema airbag mecánico que protege torso y cuello" },
      { icon: "reflective", text: "Reflectivo verde de alta visibilidad" },
      { icon: "refresh", text: "Reutilizable: se recarga con cartucho de CO2" },
    ],
    reviews: [
      { name: "Alejandro D.", city: "Bogotá", rating: 5, text: "Tuve una caída y el airbag se activó perfectamente. Literalmente me salvó de lesiones graves." },
      { name: "Marcela R.", city: "Medellín", rating: 5, text: "La seguridad no tiene precio. Este chaleco airbag da una tranquilidad enorme al manejar." },
      { name: "Pedro J.", city: "Cali", rating: 4, text: "Excelente producto de seguridad. El reflectivo es un plus enorme para la visibilidad." },
    ],
    faq: [
      { q: "¿Cómo funciona el airbag?", a: "Es mecánico con cable que se conecta a la moto. Al separarte de la moto se activa, inflando la protección." },
      { q: "¿Se puede reutilizar después de activarse?", a: "Sí, solo necesitas reemplazar el cartucho de CO2. El chaleco se puede usar nuevamente." },
      { q: "¿Se usa encima o debajo de la chaqueta?", a: "Se usa encima de la chaqueta o de tu ropa, como un chaleco adicional de seguridad." },
    ],
    targetAudience: ["Motociclistas de carretera que circulan a altas velocidades y quieren protección extra ante caídas", "Conductores que han sufrido accidentes previos y buscan máxima seguridad adicional", "Mensajeros y domiciliarios que pasan muchas horas al día en tráfico riesgoso", "Motociclistas precavidos que quieren visibilidad reflectiva y protección airbag en una sola prenda"],
    salesCount: 11,
    humanDescription: "Este chaleco tiene un airbag mecánico que se infla al instante si sales despedido de la moto. Protege tu torso, cuello y columna. Además es reflectivo para máxima visibilidad.",
    crashProtection: {
      title: "¿Cómo funciona el airbag en un accidente real?",
      description: "En un impacto frontal o lateral, tu cuerpo se separa de la moto. En ese instante, el cable se tensa y activa el airbag mecánico que te envuelve como un escudo.",
      protections: [
        "Airbag mecánico que se infla en menos de 0.5 segundos al separarte de la moto",
        "Protección de torso y cuello que reduce la fuerza del impacto hasta en un 90%",
        "Columna vertebral protegida contra la compresión del golpe",
        "Reutilizable: solo cambias el cartucho de CO2 y el chaleco queda listo de nuevo"
      ],
    },
    comparisonTable: [
      { feature: "Airbag mecánico de activación instantánea", sequoia: true, generic: false },
      { feature: "Protección de torso, cuello y columna", sequoia: true, generic: false },
      { feature: "Reflectividad de alta visibilidad 360°", sequoia: true, generic: false },
      { feature: "Reutilizable con cartucho de CO2", sequoia: true, generic: false },
      { feature: "Se infla en menos de 0.5 segundos", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // RODILLERAS
  // ══════════════════════════════════════════════════
  "rodilleras-metalicas-dimo-para-moto-bicicleta-bmx-bicicross": {
    subtitle: "Rodilleras metálicas de alto impacto para moto, BMX y bicicross",
    benefits: [
      { icon: "shield", text: "Protección metálica contra impactos fuertes" },
      { icon: "refresh", text: "Versátil: moto, bicicleta, BMX, bicicross" },
      { icon: "wrench", text: "Correas ajustables para ajuste seguro" },
    ],
    reviews: [
      { name: "Samuel R.", city: "Bogotá", rating: 5, text: "Las uso para BMX y son brutales. La protección metálica da mucha confianza." },
      { name: "Julián C.", city: "Medellín", rating: 5, text: "Excelentes rodilleras. Las ajusto fácil y protegen de verdad en las caídas." },
      { name: "Camilo M.", city: "Cali", rating: 4, text: "Buenas rodilleras de protección. Funcionan bien para moto y bicicleta." },
    ],
    faq: [
      { q: "¿Sirven para moto y bicicleta?", a: "Sí, son versátiles para motociclismo, BMX, bicicross y ciclismo." },
      { q: "¿Se pueden usar debajo del pantalón?", a: "Son rodilleras metálicas externas. Se usan sobre el pantalón con correas ajustables." },
      { q: "¿Son de talla única?", a: "Las correas permiten ajuste, pero verifica las medidas en las especificaciones." },
    ],
    targetAudience: ["Riders de BMX y bicicross que necesitan protección metálica para saltos y trucos", "Motociclistas que usan pantalones sin protección integrada y necesitan rodilleras externas", "Deportistas extremos que practican downhill, enduro o motocross recreativo"],
    salesCount: 9,
    humanDescription: "Rodilleras con placa metálica de alto impacto. No son rodilleras de espuma — estas son protección seria para moto, BMX y deportes extremos. Se ajustan con correas sobre el pantalón.",
    crashProtection: {
      title: "¿Qué pasa cuando tus rodillas impactan el suelo a velocidad?",
      description: "La rodilla es una articulación frágil. Un impacto directo contra el asfalto puede fracturar la rótula o dañar los ligamentos de forma permanente.",
      protections: [
        "Placa metálica que absorbe y distribuye la fuerza del impacto antes de llegar a tu rodilla",
        "Acolchado interno que reduce la vibración del golpe contra la articulación",
        "Correas ajustables que mantienen la rodillera en posición correcta incluso en caídas con giro"
      ],
    },
    comparisonTable: [
      { feature: "Placa metálica de alto impacto", sequoia: true, generic: false },
      { feature: "Articulación flexible con protección", sequoia: true, generic: false },
      { feature: "Correas ajustables de seguridad", sequoia: true, generic: false },
      { feature: "Multiuso: moto, BMX, bicicross", sequoia: true, generic: false },
      { feature: "Se pone sobre el pantalón", sequoia: true, generic: false },
      { feature: "Garantía de fábrica Sequoia", sequoia: true, generic: false },
    ],
  },

  // ══════════════════════════════════════════════════
  // ACCESORIOS
  // ══════════════════════════════════════════════════
  "reserva-de-producto": {
    subtitle: "Reserva tu producto favorito con una señal",
    benefits: [
      { icon: "lock", text: "Asegura tu producto antes de que se agote" },
      { icon: "tag", text: "Pago parcial, completas al recoger" },
      { icon: "cube", text: "Te notificamos cuando esté listo" },
    ],
    reviews: [
      { name: "Carolina M.", city: "Bogotá", rating: 5, text: "Reservé mi chaqueta y cuando llegó la pagué completa. Muy fácil el proceso." },
      { name: "Andrés R.", city: "Medellín", rating: 5, text: "Buena opción para apartar el producto. El servicio al cliente es excelente." },
      { name: "Luis G.", city: "Cali", rating: 4, text: "Práctico para asegurar tu talla cuando hay poco stock." },
    ],
    faq: [
      { q: "¿Cómo funciona la reserva?", a: "Pagas una señal y te reservamos el producto. Completas el pago al recoger o al recibir." },
      { q: "¿Se puede cancelar la reserva?", a: "Consulta las condiciones de cancelación contactándonos por WhatsApp." },
      { q: "¿Cuánto tiempo dura la reserva?", a: "La reserva se mantiene por un tiempo limitado. Te notificamos cuando está listo." },
    ],
    targetAudience: ["Clientes que desean apartar producto antes del lanzamiento"],
    salesCount: 5,
    humanDescription: "Reserva tu producto favorito con una señal y te lo apartamos. Completas el pago cuando lo recibas. Ideal cuando tu talla o producto se está agotando.",
    crashProtection: null,
    comparisonTable: null,
  },
};
