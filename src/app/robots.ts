import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/panel/",
          "/mi-cuenta/",
          "/checkout/",
          "/carrito/",
          "/buscar",
          "/login",
          "/registro",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/panel/", "/mi-cuenta/", "/checkout/", "/carrito/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/panel/", "/mi-cuenta/", "/checkout/", "/carrito/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/api/", "/panel/", "/mi-cuenta/", "/checkout/", "/carrito/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/api/", "/panel/", "/mi-cuenta/", "/checkout/", "/carrito/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/panel/", "/mi-cuenta/", "/checkout/", "/carrito/"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
    ],
    sitemap: "https://sequoiaspeed.com.co/sitemap.xml",
  };
}
