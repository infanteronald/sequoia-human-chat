import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sequoiaspeed.com.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  async redirects() {
    return [
      // ============================================================
      // Categorias PrestaShop -> Next.js (301 permanentes)
      // ============================================================
      { source: '/71-chaquetas', destination: '/categoria/chaquetas', permanent: true },
      { source: '/72-pantalones', destination: '/categoria/pantalones', permanent: true },
      { source: '/85-impermeables', destination: '/categoria/impermeables', permanent: true },
      { source: '/79-dotaciones-mensajeros-motorizados', destination: '/categoria/dotaciones-mensajeros-motorizados', permanent: true },
      { source: '/76-botas', destination: '/categoria/botas', permanent: true },
      { source: '/77-cascos', destination: '/categoria/cascos', permanent: true },
      { source: '/78-accesorios', destination: '/categoria/accesorios', permanent: true },
      { source: '/74-guantes-para-moto-impermeables-cuero-o-tela-bogota', destination: '/categoria/guantes-para-moto-impermeables-cuero-o-tela-bogota', permanent: true },
      { source: '/98-trajes-para-moto-antifriccion', destination: '/categoria/trajes-para-moto-antifriccion', permanent: true },
      { source: '/96-antifriccion', destination: '/categoria/trajes-para-moto-antifriccion', permanent: true },
      { source: '/87-ofertas', destination: '/categoria/ofertas', permanent: true },
      { source: '/91-cuellos', destination: '/categoria/cuellos', permanent: true },
      { source: '/82-rodilleras', destination: '/categoria/rodilleras', permanent: true },
      { source: '/95-protecciones', destination: '/categoria/protecciones', permanent: true },
      { source: '/86-airbag', destination: '/categoria/airbag', permanent: true },
      { source: '/73-cortavientos', destination: '/categoria/cortavientos', permanent: true },
      { source: '/75-jersey', destination: '/categoria/jersey', permanent: true },
      { source: '/93-reflectivos', destination: '/categoria/accesorios', permanent: true },
      { source: '/89-zapatones', destination: '/categoria/impermeables', permanent: true },
      { source: '/90-chalecos', destination: '/categoria/chaquetas', permanent: true },
      { source: '/92-landingcascos', destination: '/categoria/cascos', permanent: true },
      { source: '/97-chaleco-airbag-motociclista-moto-colombia', destination: '/categoria/airbag', permanent: true },
      { source: '/70-textiles', destination: '/', permanent: true },

      // ============================================================
      // Productos PrestaShop -> Next.js (301 permanentes)
      // Formato viejo: /{categoria}/{id}-{slug}.html
      // ============================================================
      // Chaquetas
      { source: '/chaquetas/27-chaqueta-carrera-blue-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed.html', destination: '/producto/chaqueta-carrera-blue-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed', permanent: true },
      { source: '/chaquetas/28-chaqueta-carrera-green-antifriccion-con-protecciones-certificadas-e-impermeable-100.html', destination: '/producto/chaqueta-carrera-green-antifriccion-con-protecciones-certificadas-e-impermeable-100', permanent: true },
      { source: '/chaquetas/32-chaqueta-mesh-de-verano-antifriccion-en-malla-transpirable-100-impermeable.html', destination: '/producto/chaqueta-mesh-de-verano-antifriccion-en-malla-transpirable-100-impermeable', permanent: true },
      { source: '/chaquetas/349-chaqueta-reflectiva-de-moto-tipo-cortaviento-con-protecciones-motociclista-para-damas-y-caballeros.html', destination: '/producto/chaqueta-reflectiva-de-moto-tipo-cortaviento-con-protecciones-motociclista-para-damas-y-caballeros', permanent: true },
      { source: '/chaquetas/353-chaqueta-impermeable-con-protecciones-removibles-certificadas-unisex.html', destination: '/producto/chaqueta-impermeable-con-protecciones-removibles-certificadas-unisex', permanent: true },
      { source: '/chaquetas/459-chaqueta-reflectiva-firefly-ii-con-protecciones-moto-motociclista-reflectiva-negragris-neon-moto-bicicleta-ciclismo.html', destination: '/producto/chaqueta-reflectiva-firefly-ii-con-protecciones-moto-motociclista-reflectiva-negragris-neon-moto-bicicleta-ciclismo', permanent: true },
      { source: '/chaquetas/492-chaqueta-tt-protecciones-removibles-certificadas-100-impermeable.html', destination: '/producto/chaqueta-tt-protecciones-removibles-certificadas-100-impermeable', permanent: true },
      { source: '/chaquetas/494-chaqueta-carrera-red-antifriccion-protecciones-certificadas-e-impermeable.html', destination: '/producto/chaqueta-carrera-red-antifriccion-protecciones-certificadas-e-impermeable', permanent: true },
      { source: '/chaquetas/509-chaqueta-hydra-impermeable-tipo-touring.html', destination: '/producto/chaqueta-hydra-impermeable-tipo-touring', permanent: true },
      { source: '/chaquetas/541-chaqueta-black-pro-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed.html', destination: '/producto/chaqueta-black-pro-chaqueta-antifriccion-de-moto-impermeable-sequoia-speed', permanent: true },
      { source: '/chaquetas/550-chaqueta-black-pro-dama-chaqueta-de-proteccion-de-moto-para-damas-impermeable-sequoia-speed.html', destination: '/producto/chaqueta-black-pro-dama-chaqueta-de-proteccion-de-moto-para-damas-impermeable-sequoia-speed', permanent: true },
      { source: '/chaquetas/551-chaqueta-avs.html', destination: '/producto/chaqueta-avs', permanent: true },
      { source: '/chaquetas/553-chaqueta-reflectiva-doble-faz-impermeable-de-moto-para-damas-y-caballeros.html', destination: '/producto/chaqueta-reflectiva-doble-faz-impermeable-de-moto-para-damas-y-caballeros', permanent: true },
      { source: '/chaquetas/561-chaqueta-sahara-protecciones-certificadas-100-impermeable.html', destination: '/producto/chaqueta-sahara-protecciones-certificadas-100-impermeable', permanent: true },

      // Pantalones
      { source: '/pantalones/38-pantalon-gas-black-impermeable-protecciones-certificadas-removibles-material-antifriccion.html', destination: '/producto/pantalon-gas-black-impermeable-protecciones-certificadas-removibles-material-antifriccion', permanent: true },
      { source: '/pantalones/493-pantalon-gas-ladies-pantalon-de-proteccion-impermeable-con-protectores-certificados-removibles.html', destination: '/producto/pantalon-gas-ladies-pantalon-de-proteccion-impermeable-con-protectores-certificados-removibles', permanent: true },
      { source: '/pantalones/502-pantalon-gas-green-proteccion-rodillas-certificadas-removibles-impermeable.html', destination: '/producto/pantalon-gas-green-proteccion-rodillas-certificadas-removibles-impermeable', permanent: true },
      { source: '/pantalones/539-pantalon-impermeable-tipo-sudadera-para-moto-con-forro-siliconado-interno.html', destination: '/producto/pantalon-impermeable-tipo-sudadera-para-moto-con-forro-siliconado-interno', permanent: true },
      { source: '/pantalones/555-pantalon-black-pro-pantalon-antifriccion-impermeable-para-motorizado-con-protecciones-certificadas.html', destination: '/producto/pantalon-black-pro-pantalon-antifriccion-impermeable-para-motorizado-con-protecciones-certificadas', permanent: true },
      { source: '/pantalones/558-pantalon-sahara-impermeable-protecciones-certificadas-removibles-material-antifriccion.html', destination: '/producto/pantalon-sahara-impermeable-protecciones-certificadas-removibles-material-antifriccion', permanent: true },

      // Impermeables
      { source: '/impermeables/267-combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo.html', destination: '/producto/combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo', permanent: true },
      { source: '/impermeables/508-traje-impermeable-para-moto-tipo-sudadera-con-forro-de-silicon-interna.html', destination: '/producto/traje-impermeable-para-moto-tipo-sudadera-con-forro-de-silicon-interna', permanent: true },
      { source: '/impermeables/516-impermeable-tipo-sudadera-liviano-plegable.html', destination: '/producto/impermeable-tipo-sudadera-liviano-plegable', permanent: true },
      { source: '/impermeables/543-combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo.html', destination: '/producto/combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-moto-motociclismo', permanent: true },
      { source: '/impermeables/559-combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-guantes-motociclismo.html', destination: '/producto/combo-impermeable-zapatones-sequoia-suela-dura-forro-morral-moto-guantes-motociclismo', permanent: true },
      { source: '/impermeables/560-combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-guantes-moto-motociclismo.html', destination: '/producto/combo-impermeable-hydra-zapatones-sequoia-suela-dura-forro-morral-guantes-moto-motociclismo', permanent: true },

      // Botas
      { source: '/botas/223-botas-de-caucho-impermeables-dakar-negra-moto-motociclismo.html', destination: '/producto/botas-de-caucho-impermeables-dakar-negra-moto-motociclismo', permanent: true },
      { source: '/inicio/410-zapatones-impermeables-para-motociclista-moto-motociclismo-motero.html', destination: '/producto/zapatones-impermeables-para-motociclista-moto-motociclismo-motero', permanent: true },

      // Guantes
      { source: '/guantes-para-moto-impermeables-cuero-o-tela-bogota/367-guantes-para-motociclista-moto-marca-sequoia-speed-para-hombre-o-mujer-2-bogota.html', destination: '/producto/guantes-para-motociclista-moto-marca-sequoia-speed-para-hombre-o-mujer-2-bogota', permanent: true },
      { source: '/guantes-para-moto-impermeables-cuero-o-tela-bogota/522-guantes-mx-negros-con-proteccion-de-nudillos.html', destination: '/producto/guantes-mx-negros-con-proteccion-de-nudillos', permanent: true },
      { source: '/guantes-para-moto-impermeables-cuero-o-tela-bogota/536-guantes-cana-larga-de-cuero-predator-para-moto-de-proteccion.html', destination: '/producto/guantes-cana-larga-de-cuero-predator-para-moto-de-proteccion', permanent: true },
      { source: '/guantes-para-moto-impermeables-cuero-o-tela-bogota/537-guantes-cana-media-de-cuero-intruder-para-moto-de-proteccion.html', destination: '/producto/guantes-cana-media-de-cuero-intruder-para-moto-de-proteccion', permanent: true },
      { source: '/guantes-para-moto-impermeables-cuero-o-tela-bogota/538-guantes-cana-corta-de-cuero-raptor-para-moto-de-proteccion.html', destination: '/producto/guantes-cana-corta-de-cuero-raptor-para-moto-de-proteccion', permanent: true },

      // Trajes
      { source: '/trajes-para-moto-antifriccion/531-traje-para-moto-mesh-traje-de-proteccion-anti-friccion-para-motociclistas.html', destination: '/producto/traje-para-moto-mesh-traje-de-proteccion-anti-friccion-para-motociclistas', permanent: true },
      { source: '/trajes-para-moto-antifriccion/532-traje-para-moto-carrera-traje-de-proteccion-anti-friccion-para-motociclistas.html', destination: '/producto/traje-para-moto-carrera-traje-de-proteccion-anti-friccion-para-motociclistas', permanent: true },
      { source: '/trajes-para-moto-antifriccion/533-traje-para-moto-tt-traje-de-proteccion-anti-friccion-para-moto.html', destination: '/producto/traje-para-moto-tt-traje-de-proteccion-anti-friccion-para-moto', permanent: true },
      { source: '/trajes-para-moto-antifriccion/542-traje-anti-friccion-black-pro-de-moto-impermeable-sequoia-speed.html', destination: '/producto/traje-anti-friccion-black-pro-de-moto-impermeable-sequoia-speed', permanent: true },

      // Airbag
      { source: '/airbag/497-chaleco-airbag-motociclista-verde-reflectivo-alta-visibilidad.html', destination: '/producto/chaleco-airbag-motociclista-verde-reflectivo-alta-visibilidad', permanent: true },

      // Rodilleras
      { source: '/rodilleras/185-rodilleras-metalicas-dimo-para-moto-bicicleta-bmx-bicicross.html', destination: '/producto/rodilleras-metalicas-dimo-para-moto-bicicleta-bmx-bicicross', permanent: true },

      // Accesorios
      { source: '/accesorios/263-cubre-maletas-impermeable-sequoia-speed.html', destination: '/producto/cubre-maletas-impermeable-sequoia-speed', permanent: true },
      { source: '/accesorios/514-reserva-de-producto.html', destination: '/producto/reserva-de-producto', permanent: true },

      // Dotaciones
      { source: '/dotaciones-mensajeros-motorizados/509-chaqueta-hydra-impermeable-tipo-touring.html', destination: '/producto/chaqueta-hydra-impermeable-tipo-touring', permanent: true },

      // ============================================================
      // CMS Pages PrestaShop -> Next.js
      // ============================================================
      { source: '/content/13-trajes-antifriccion-dotaciones-uniformes-de-motociclistas-y-mensajeros', destination: '/categoria/trajes-para-moto-antifriccion', permanent: true },
      { source: '/content/11-fabrica-de-impermeables-para-moto', destination: '/categoria/impermeables', permanent: true },
      { source: '/content/12-bordados-personalizados-en-bogota-alta-calidad-y-rapidez', destination: '/', permanent: true },
      { source: '/content/8-cascos-para-dotacion', destination: '/categoria/cascos', permanent: true },
      { source: '/content/9-impermeable-de-pvc', destination: '/categoria/impermeables', permanent: true },
      { source: '/content/10-terminos-y-condiciones', destination: '/privacidad', permanent: true },
      { source: '/content/3-terms-and-conditions-of-use', destination: '/privacidad', permanent: true },

      // ============================================================
      // URLs generales de PrestaShop
      // ============================================================
      { source: '/sequoia-speed-colombia-indumentaria-para-moto', destination: '/', permanent: true },
      { source: '/inicio', destination: '/', permanent: true },
      // { source: '/mi-cuenta', destination: '/', permanent: true }, // REMOVED - breaks login redirect
      { source: '/tienda', destination: '/', permanent: true },
      { source: '/mapa-del-sitio', destination: '/', permanent: true },
      { source: '/contactenos', destination: '/contacto', permanent: true },
      { source: '/1_sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/1_index_sitemap.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/1_cb_0_sitemap.xml', destination: '/sitemap.xml', permanent: true },
    ];
  },
};

export default nextConfig;
