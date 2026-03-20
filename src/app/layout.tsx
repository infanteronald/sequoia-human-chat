import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { LayoutShell } from "@/components/LayoutShell";
import { GTMHead, GTMBody, GTMRouteTracker } from "@/components/TagManager";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sequoiaspeed.com.co"),
  title: {
    default: "Sequoia Speed - Indumentaria y Protección para Motociclistas | Colombia",
    template: "%s | Sequoia Speed",
  },
  description:
    "Tienda online de chaquetas, guantes, botas, cascos, impermeables y accesorios para motociclistas en Colombia. Protección certificada CE con estilo. Envío a toda Colombia. Pago contra entrega.",
  keywords: [
    "indumentaria motociclista",
    "chaquetas para moto",
    "guantes para moto",
    "cascos para moto",
    "botas para moto",
    "impermeables para moto",
    "accesorios moto Colombia",
    "ropa para moto Bogotá",
    "protección motociclista",
    "trajes antifricción",
    "dotaciones para motorizados",
    "EPP motociclistas",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Sequoia Speed",
    title: "Sequoia Speed - Indumentaria y Protección para Motociclistas",
    description:
      "Chaquetas, guantes, botas, cascos, impermeables y accesorios para motociclistas. Protección certificada CE. Envío a toda Colombia.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Sequoia Speed - Indumentaria para Motociclistas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sequoia Speed - Indumentaria para Motociclistas",
    description: "Protección certificada con estilo. Envío a toda Colombia.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "45d389c09a7d0e5b",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${bebas.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-neutral-950 text-white antialiased min-h-screen flex flex-col">
        <GTMHead />
        <GTMBody />
        <GTMRouteTracker />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Store",
            "@id": "https://sequoiaspeed.com.co/#organization",
            name: "Sequoia Speed",
            telephone: "+57-324-789-2412",
            url: "https://sequoiaspeed.com.co",
            logo: "https://sequoiaspeed.com.co/logo.png",
            image: "https://sequoiaspeed.com.co/logo.png",
            description:
              "Tienda online de indumentaria y accesorios para motociclistas en Colombia. Protección certificada CE con estilo.",
            priceRange: "$$",
            currenciesAccepted: "COP",
            paymentAccepted: "Efectivo, Tarjeta de crédito, Transferencia bancaria, Nequi, Daviplata",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Bogotá",
              addressLocality: "Bogotá",
              addressRegion: "Cundinamarca",
              postalCode: "110111",
              addressCountry: "CO",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 4.6687,
              longitude: -74.0665,
            },
            areaServed: {
              "@type": "Country",
              name: "Colombia",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+57-324-789-2412",
              contactType: "sales",
              availableLanguage: "Spanish",
            },
            sameAs: [
              "https://www.instagram.com/sequoiaspeed.co",
              "https://www.facebook.com/sequoiaspeed.co",
              "https://twitter.com/SequoiaSpeed",
              "https://www.youtube.com/channel/UCOJLfvLewklDUPHWlNbsvZA",
              "https://www.moto-dotaciones.com",
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Sequoia Speed",
            url: "https://sequoiaspeed.com.co",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://sequoiaspeed.com.co/buscar?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
