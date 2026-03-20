"use client";
import { ProductQuestions } from "@/components/ProductQuestions";
import { productSEOContent } from "@/lib/product-seo-content";

import Image from "next/image";
import Link from "next/link";
import { HeroIcon } from "@/components/HeroIcon";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import * as gtag from "@/lib/datalayer";
// CRO data now comes from DB via props

/* ── Types ─────────────────────────────────────────── */

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  priceModifier: number;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isCover: boolean;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

interface ProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number | null;
    reference: string | null;
    images: ProductImage[];
    variants: Variant[];
    categoryName: string;
    categorySlug: string;
    subtitle?: string;
    benefits?: { icon: string; text: string }[] | null;
    reviews?: { name: string; city: string; rating: number; text: string }[] | null;
    faq?: { q: string; a: string }[] | null;
    targetAudience?: string[] | null;
    salesCount?: number | null;
    humanDescription?: string | null;
    crashProtection?: {
      title: string;
      description: string;
      protections: string[];
    } | null;
    comparisonTable?: { feature: string; sequoia: boolean; generic: boolean }[] | null;
  };
  questions?: { id: string; authorName: string; question: string; answer: string | null; answeredAt: string | null; helpfulYes: number; helpfulNo: number; createdAt: string }[];
  relatedProducts?: RelatedProduct[];
  crossSellProducts?: RelatedProduct[];
}

/* ── CRO Config: Category-specific content ─────────── */

const categoryBenefits: Record<string, { icon: string; text: string }[]> = {
  impermeables: [
    { icon: "droplet", text: "No te mojas incluso en lluvia fuerte" },
    { icon: "reflective", text: "Visible de noche con reflectivos 360°" },
    { icon: "📱", text: "Celular y documentos protegidos del agua" },
  ],
  chaquetas: [
    { icon: "shield", text: "Protegido ante caídas con CE Nivel 2" },
    { icon: "wind", text: "Ventilación que no sacrifica seguridad" },
    { icon: "muscle", text: "Lona antifricción de alta resistencia" },
  ],
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": [
    { icon: "hand", text: "Mejor agarre en mojado y seco" },
    { icon: "shield", text: "Protección de nudillos reforzada" },
    { icon: "touch", text: "Tacto real para controles del manubrio" },
  ],
  pantalones: [
    { icon: "shield", text: "Protección de rodillas y cadera certificada" },
    { icon: "muscle", text: "Resistente a la abrasión en asfalto" },
    { icon: "wind", text: "Cómodo para rutas largas" },
  ],
  botas: [
    { icon: "shield", text: "Protección de tobillo ante impactos" },
    { icon: "droplet", text: "Impermeables para clima lluvioso" },
    { icon: "bolt", text: "Suela antideslizante para mejor apoyo" },
  ],
  "trajes-para-moto-antifriccion": [
    { icon: "shield", text: "Protección completa de cuerpo entero" },
    { icon: "muscle", text: "Material antifricción certificado" },
    { icon: "wind", text: "Ventilación estratégica para clima cálido" },
  ],
  cascos: [
    { icon: "shield", text: "Protege lo más importante: tu cabeza" },
    { icon: "shield", text: "Certificación DOT/ECE garantizada" },
    { icon: "wind", text: "Ventilación interna anti-empañamiento" },
  ],
  airbag: [
    { icon: "shield", text: "Airbag mecánico que protege torso y cuello en caída" },
    { icon: "reflective", text: "Reflectivo de alta visibilidad nocturna" },
    { icon: "refresh", text: "Reutilizable: se recarga con cartucho de CO2" },
  ],
  rodilleras: [
    { icon: "shield", text: "Protección metálica contra impactos fuertes" },
    { icon: "refresh", text: "Versátil: moto, bicicleta, BMX, bicicross" },
    { icon: "wrench", text: "Correas ajustables para ajuste seguro" },
  ],
  accesorios: [
    { icon: "lock", text: "Producto original Sequoia Speed" },
    { icon: "badge", text: "Calidad garantizada de fábrica" },
    { icon: "bolt", text: "Diseñado para motociclistas colombianos" },
  ],
};

const defaultBenefits = [
  { icon: "shield", text: "Protección certificada para motociclistas" },
  { icon: "droplet", text: "Resistente al agua y clima adverso" },
  { icon: "muscle", text: "Materiales de alta resistencia" },
];

const categoryStorytelling: Record<string, string> = {
  impermeables:
    "Diseñado para motociclistas que no dejan que la lluvia detenga su camino. Mensajeros, repartidores y commuters que necesitan llegar secos sin importar el clima.",
  chaquetas:
    "Para el motociclista que no negocia su seguridad. Protección certificada CE sin sacrificar estilo ni comodidad, lista para el día a día en la ciudad o la carretera.",
  "guantes-para-moto-impermeables-cuero-o-tela-bogota":
    "Tus manos controlan la moto. Guantes diseñados para ofrecer el agarre y la protección que necesitas en cada maniobra, sin perder sensibilidad.",
  pantalones:
    "Protección que no se nota hasta que la necesitas. Pantalones diseñados para el motociclista urbano que quiere seguridad sin renunciar a la comodidad.",
  botas:
    "Tus pies merecen la misma protección que el resto de tu cuerpo. Botas que combinan seguridad, impermeabilidad y comodidad para el motociclista exigente.",
  "trajes-para-moto-antifriccion":
    "Protección completa de pies a cabeza. Para motociclistas que entienden que la seguridad no se toma a medias — el traje es tu segunda piel en la carretera.",
  cascos:
    "El casco es la pieza más importante de tu equipo. Protección certificada que puede salvar tu vida, con el confort necesario para rutas largas.",
  airbag:
    "El chaleco airbag es la máxima expresión de seguridad para motociclistas. Protección activa que se despliega cuando más la necesitas.",
  rodilleras:
    "Protección específica para tus rodillas en cualquier disciplina sobre ruedas. Para motociclistas, ciclistas y deportistas extremos.",
  accesorios:
    "Complementos esenciales para tu equipo de motociclismo. Cada detalle cuenta para tu seguridad y comodidad.",
};

const categoryCTA: Record<string, string> = {
  impermeables: "Llega seco a tu destino",
  chaquetas: "Protección real para cada viaje",
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": "Mejor agarre, más control",
  pantalones: "Seguridad sin sacrificar comodidad",
  botas: "Pisa firme en cualquier terreno",
  "trajes-para-moto-antifriccion": "Protección completa sin compromisos",
  cascos: "Protege lo que más importa",
  airbag: "Tu vida vale más que todo",
  rodilleras: "Protege tus rodillas en cada aventura",
  accesorios: "Complementa tu equipo de seguridad",
};

const categoryReviews: Record<string, { name: string; city: string; rating: number; text: string }[]> = {
  impermeables: [
    { name: "Carlos R.", city: "Bogotá", rating: 5, text: "Excelente calidad. La uso todos los días para ir al trabajo y ha resistido varias lluvias fuertes sin problema." },
    { name: "Andrés M.", city: "Medellín", rating: 5, text: "Por fin un impermeable que realmente no deja pasar agua. Las costuras selladas hacen la diferencia." },
    { name: "Laura G.", city: "Cali", rating: 4, text: "Muy bueno para la lluvia. Los reflectivos dan mucha seguridad de noche. La talla es exacta." },
  ],
  chaquetas: [
    { name: "Miguel A.", city: "Bogotá", rating: 5, text: "La protección se siente sólida y el material es de primera. Se nota la diferencia con las chaquetas baratas." },
    { name: "Julián P.", city: "Bucaramanga", rating: 5, text: "Perfecta para el uso diario. Ventila bien en el calor y protege de verdad. 100% recomendada." },
    { name: "Sandra L.", city: "Pereira", rating: 4, text: "Buena calidad de costura y materiales. Las protecciones removibles son un plus enorme." },
  ],
  "guantes-para-moto-impermeables-cuero-o-tela-bogota": [
    { name: "Sergio R.", city: "Bogotá", rating: 5, text: "Excelente agarre y protección. Se ajustan perfecto a la mano." },
    { name: "Valentina C.", city: "Medellín", rating: 5, text: "Cómodos y seguros. El cuero se va moldeando a la mano." },
    { name: "Pablo M.", city: "Cali", rating: 4, text: "Buenos guantes con protección real. Buen precio." },
  ],
  pantalones: [
    { name: "Felipe H.", city: "Bogotá", rating: 5, text: "Buenas protecciones de rodilla y material resistente. Impermeable de verdad." },
    { name: "Sandra G.", city: "Medellín", rating: 5, text: "Cómodo para manejar y con protecciones que se sienten seguras." },
    { name: "Diego R.", city: "Cali", rating: 4, text: "Buen pantalón de protección. Resistente y bien hecho." },
  ],
  botas: [
    { name: "Andrés G.", city: "Bogotá", rating: 5, text: "Impermeables de verdad. Las uso todos los días y no entra agua." },
    { name: "Felipe R.", city: "Manizales", rating: 5, text: "Buenas botas para moto. Cómodas y la suela agarra bien." },
    { name: "Carolina T.", city: "Medellín", rating: 4, text: "Buenas para la lluvia. Fáciles de poner y quitar." },
  ],
  "trajes-para-moto-antifriccion": [
    { name: "Juan Carlos M.", city: "Bogotá", rating: 5, text: "Protección total de pies a cabeza. Vale la inversión." },
    { name: "Alejandra S.", city: "Medellín", rating: 5, text: "La combinación de chaqueta + pantalón es imbatible. Calidad premium." },
    { name: "Diego V.", city: "Pereira", rating: 4, text: "Excelente traje. Se siente la protección y es impermeable." },
  ],
  airbag: [
    { name: "Alejandro D.", city: "Bogotá", rating: 5, text: "Tuve una caída y el airbag se activó perfectamente. Me salvó de lesiones graves." },
    { name: "Marcela R.", city: "Medellín", rating: 5, text: "La seguridad no tiene precio. Este chaleco da una tranquilidad enorme." },
    { name: "Pedro J.", city: "Cali", rating: 4, text: "Excelente producto de seguridad. El reflectivo es un plus enorme." },
  ],
  rodilleras: [
    { name: "Samuel R.", city: "Bogotá", rating: 5, text: "Protección metálica que da mucha confianza. Sirven para moto y BMX." },
    { name: "Julián C.", city: "Medellín", rating: 5, text: "Se ajustan fácil y protegen de verdad en las caídas." },
    { name: "Camilo M.", city: "Cali", rating: 4, text: "Buenas rodilleras. Funcionan bien para moto y bicicleta." },
  ],
  accesorios: [
    { name: "Carolina M.", city: "Bogotá", rating: 5, text: "Buena calidad como siempre en Sequoia. Producto original." },
    { name: "Andrés R.", city: "Medellín", rating: 5, text: "El servicio al cliente es excelente. Producto de calidad." },
    { name: "Luis G.", city: "Cali", rating: 4, text: "Cumple con lo esperado. Buena calidad de materiales." },
  ],
  default: [
    { name: "Carlos R.", city: "Bogotá", rating: 5, text: "Excelente calidad y protección real. La uso todos los días para ir al trabajo en moto." },
    { name: "Diana M.", city: "Medellín", rating: 5, text: "Muy satisfecha con la compra. El material es resistente y se nota que es producto de calidad." },
    { name: "Jorge H.", city: "Cali", rating: 4, text: "Buen producto, envío rápido. Recomiendo comprar aquí por la atención al cliente." },
  ],
};

/* ── Combo items parser ────────────────────────────── */

const comboIconMap: Record<string, string> = {
  chaqueta: "shield",
  impermeable: "droplet",
  pantalón: "shield",
  pantalon: "shield",
  zapatones: "bolt",
  zapaton: "bolt",
  zapatón: "bolt",
  guantes: "hand",
  guante: "hand",
  forro: "cube",
  morral: "cube",
  casco: "shield",
  bota: "bolt",
  botas: "bolt",
  maleta: "cube",
  chaleco: "shield",
};

function parseComboItems(name: string): { label: string; icon: string }[] | null {
  if (!name.toLowerCase().includes("combo")) return null;

  // Split by "+" and clean up
  const parts = name.split("+").map((s) => s.trim());
  if (parts.length < 2) return null;

  return parts.map((part) => {
    // Remove brand/marketing words
    const cleaned = part
      .replace(/combo\s*/i, "")
      .replace(/sequoia\s*/i, "")
      .replace(/suela\s+dura/i, "")
      .replace(/moto\s*/i, "")
      .replace(/motociclismo\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();

    // Find matching icon
    const lowerPart = cleaned.toLowerCase();
    let icon = "✅";
    for (const [key, emoji] of Object.entries(comboIconMap)) {
      if (lowerPart.includes(key)) {
        icon = emoji;
        break;
      }
    }

    // Capitalize first letter
    const label = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return { label, icon };
  }).filter((item) => item.label.length > 0);
}

/* ── Size guide data ───────────────────────────────── */

const sizeGuideData = {
  chaquetas: {
    title: "Guía de Tallas — Chaquetas",
    headers: ["Talla", "Pecho (cm)", "Cintura (cm)", "Largo (cm)"],
    rows: [
      ["S", "92–96", "80–84", "62"],
      ["M", "96–100", "84–88", "63"],
      ["L", "100–104", "88–92", "64"],
      ["XL", "104–108", "92–96", "65"],
      ["2XL", "108–112", "96–100", "66"],
    ],
  },
  pantalones: {
    title: "Guía de Tallas — Pantalones",
    headers: ["Talla", "Cintura (cm)", "Cadera (cm)", "Largo (cm)"],
    rows: [
      ["S", "76–80", "92–96", "100"],
      ["M", "80–84", "96–100", "102"],
      ["L", "84–88", "100–104", "104"],
      ["XL", "88–92", "104–108", "106"],
      ["2XL", "92–96", "108–112", "108"],
    ],
  },
  default: {
    title: "Guía de Tallas",
    headers: ["Talla", "Pecho (cm)", "Cintura (cm)", "Cadera (cm)"],
    rows: [
      ["S", "92–96", "80–84", "92–96"],
      ["M", "96–100", "84–88", "96–100"],
      ["L", "100–104", "88–92", "100–104"],
      ["XL", "104–108", "92–96", "104–108"],
      ["2XL", "108–112", "96–100", "108–112"],
    ],
  },
};

/* ── Zoom hook ─────────────────────────────────────── */

function useImageZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }, []);

  return { containerRef, zoom, setZoom, position, handleMouseMove };
}

/* ── Star Rating SVG ───────────────────────────────── */

function Stars({ rating = 4.8, count = 24 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = star <= Math.floor(rating) ? 100 : star === Math.ceil(rating) ? (rating % 1) * 100 : 0;
          return (
            <svg key={star} className="w-4 h-4" viewBox="0 0 20 20">
              <defs>
                <linearGradient id={`star-${star}`}>
                  <stop offset={`${fill}%`} stopColor="#f59e0b" />
                  <stop offset={`${fill}%`} stopColor="#525252" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#star-${star})`}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm text-amber-400 font-medium">{Number(rating).toFixed(1)}</span>
      <span className="text-sm text-neutral-400">({count} reseñas verificadas)</span>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────── */

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DropIcon = () => (
  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
  </svg>
);

const FabricIcon = () => (
  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const AwardIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const ChevronIcon = ({ open }: { open?: boolean }) => (
  <svg className={`w-5 h-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ── Size Guide Modal ──────────────────────────────── */

function SizeGuideModal({ isOpen, onClose, categorySlug }: { isOpen: boolean; onClose: () => void; categorySlug: string }) {
  const guide = sizeGuideData[categorySlug as keyof typeof sizeGuideData] || sizeGuideData.default;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition">
          <CloseIcon />
        </button>

        <h3 className="font-heading text-xl mb-4">{guide.title}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                {guide.headers.map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-neutral-400 font-medium text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row, i) => (
                <tr key={i} className="border-b border-neutral-800">
                  {row.map((cell, j) => (
                    <td key={j} className={`py-2.5 px-3 ${j === 0 ? "font-bold text-white" : "text-neutral-300"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 bg-neutral-800/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-white">Como medirte</h4>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li>1. Usa una cinta métrica flexible sobre ropa ligera</li>
            <li>2. <strong className="text-neutral-300">Pecho:</strong> Mide alrededor de la parte más ancha del pecho</li>
            <li>3. <strong className="text-neutral-300">Cintura:</strong> Mide a la altura del ombligo</li>
            <li>4. <strong className="text-neutral-300">Cadera:</strong> Mide la parte más ancha de la cadera</li>
          </ul>
          <p className="text-xs text-amber-400 mt-2">Si estás entre dos tallas, elige la más grande para mayor comodidad con protecciones.</p>
        </div>
      </div>
    </div>
  );
}

/* ── ViewersCount Component ────────────────────────── */

function ViewersCount() {
  const [viewers, setViewers] = useState(0);
  useEffect(() => {
    const gen = () => Math.floor(Math.random() * 10) + 3;
    setViewers(gen());
    const interval = setInterval(() => setViewers(gen()), 30000);
    return () => clearInterval(interval);
  }, []);
  if (!viewers) return null;
  return (
    <span className="flex items-center gap-1 text-neutral-400">
      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" /></span>
      {viewers} personas viendo esto
    </span>
  );
}

/* ── Main Component ────────────────────────────────── */


/* ── Thumbnail Carousel with auto-scroll ─────────── */
function ThumbnailCarousel({
  images,
  selectedImage,
  onSelect,
  productName,
}: {
  images: ProductImage[];
  selectedImage: number;
  onSelect: (i: number) => void;
  productName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll animation
  useEffect(() => {
    if (images.length <= 4 || isHovered) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const thumbWidth = 80 + 8; // w-20 + gap-2
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: thumbWidth, behavior: "smooth" });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  // Scroll selected thumbnail into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const thumb = el.children[selectedImage] as HTMLElement;
    if (thumb) {
      const thumbLeft = thumb.offsetLeft;
      const thumbRight = thumbLeft + thumb.offsetWidth;
      const scrollLeft = el.scrollLeft;
      const scrollRight = scrollLeft + el.clientWidth;
      if (thumbLeft < scrollLeft || thumbRight > scrollRight) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedImage]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1"
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => onSelect(i)}
            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
              i === selectedImage
                ? "border-primary shadow-lg shadow-primary/20 scale-105"
                : "border-transparent hover:border-neutral-500 opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={img.url} alt={img.alt || `${productName} vista ${i + 1}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
      {/* Fade edges */}
      {images.length > 5 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none rounded-l-lg" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none rounded-r-lg" />
        </>
      )}
    </div>
  );
}

export function ProductDetail({ product, questions = [], relatedProducts = [], crossSellProducts = [] }: ProductProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { dispatch } = useCart();
  const buyZoneRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const { zoom, setZoom, position, handleMouseMove } = useImageZoom();

  // ── GA4: view_item ──
  useEffect(() => {
    gtag.viewItem(
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.categoryName,
        price: product.price,
        quantity: 1,
      },
      product.price
    );
  }, [product.id]);

  // ── Parse variant attributes ──
  const variantAttributes = (() => {
    const attrs: { color: string | null; size: string | null }[] = [];
    const allColors: string[] = [];
    const allSizes: string[] = [];
    const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];

    for (const v of product.variants) {
      const parts = v.name.split("/").map(s => s.trim());
      let color: string | null = null;
      let size: string | null = null;

      for (const part of parts) {
        const [key, ...rest] = part.split(":").map(s => s.trim());
        const value = rest.join(":").trim();
        if (key.toLowerCase() === "color" && value) {
          color = value;
        } else if (key.toLowerCase() === "talla" && value) {
          size = value;
        } else if (!value && key) {
          size = key;
        }
      }

      attrs.push({ color, size });
      if (color && !allColors.includes(color)) allColors.push(color);
      if (size && !allSizes.includes(size)) allSizes.push(size);
    }

    allSizes.sort((a, b) => {
      const ia = sizeOrder.indexOf(a);
      const ib = sizeOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    const hasColors = allColors.length > 0;
    return { attrs, allColors, allSizes, hasColors };
  })();

  const { attrs: parsedAttrs, allColors, allSizes, hasColors } = variantAttributes;

  const [selectedColor, setSelectedColor] = useState<string | null>(
    hasColors ? (parsedAttrs.find(a => a.color)?.color || null) : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    parsedAttrs[0]?.size || null
  );

  const findVariant = (color: string | null, size: string | null): Variant | null => {
    for (let i = 0; i < product.variants.length; i++) {
      const a = parsedAttrs[i];
      if (hasColors) {
        if (a.color === color && a.size === size) return product.variants[i];
      } else {
        if (a.size === size) return product.variants[i];
      }
    }
    return null;
  };

  const selectedVariant = findVariant(selectedColor, selectedSize);

  const sizesForColor = (color: string | null) => {
    const available = new Map<string, { inStock: boolean; variant: Variant }>();
    for (let i = 0; i < product.variants.length; i++) {
      const a = parsedAttrs[i];
      if (hasColors && a.color !== color) continue;
      if (a.size) {
        available.set(a.size, { inStock: product.variants[i].stock > 0, variant: product.variants[i] });
      }
    }
    return available;
  };

  const colorHasStock = (color: string) => {
    for (let i = 0; i < product.variants.length; i++) {
      if (parsedAttrs[i].color === color && product.variants[i].stock > 0) return true;
    }
    return false;
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const sizes = sizesForColor(color);
    if (!selectedSize || !sizes.has(selectedSize)) {
      const firstAvailable = allSizes.find(s => sizes.has(s) && sizes.get(s)!.inStock) || allSizes.find(s => sizes.has(s));
      setSelectedSize(firstAvailable || null);
    }
  };

  const currentPrice = product.price + (selectedVariant?.priceModifier || 0);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const stockCount = selectedVariant?.stock || 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const availableSizes = sizesForColor(selectedColor);

  // CRO data - per-product config overrides category defaults
  const comboItems = parseComboItems(product.name);
  // CRO data from DB (passed as props)
  const benefits = product.benefits || categoryBenefits[product.categorySlug] || defaultBenefits;
  const subtitle = product.subtitle || null;
  const storytelling = categoryStorytelling[product.categorySlug];
  const ctaText = categoryCTA[product.categorySlug] || "Equípate con lo mejor";
  const reviews = product.reviews || categoryReviews[product.categorySlug] || categoryReviews.default;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 4.8;
  const productFaq = product.faq || null;
  const savings = product.compareAtPrice && product.compareAtPrice > currentPrice
    ? { original: product.compareAtPrice, saved: product.compareAtPrice - currentPrice, percent: Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100) }
    : null;

  // Sticky bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (buyZoneRef.current) {
        const rect = buyZoneRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Touch swipe for mobile gallery
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedImage < product.images.length - 1) {
        setSelectedImage(selectedImage + 1);
      } else if (diff < 0 && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      }
    }
  };

  function addToCart() {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: currentPrice,
        image: product.images[0]?.url || "/products/placeholder.jpg",
        slug: product.slug,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        quantity,
      },
    });
    gtag.addToCart(
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.categoryName,
        item_variant: selectedVariant?.name,
        price: currentPrice,
        quantity,
      },
      currentPrice * quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  const whatsappText = `Hola, me interesa: ${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ""}`;
  const whatsappUrl = `https://wa.me/573247892412?text=${encodeURIComponent(whatsappText)}`;

  const currentImage = product.images[selectedImage];

  return (
    <>
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} categorySlug={product.categorySlug} />

      {/* ── Desktop Sticky Mini Bar ──────────────────── */}
      <div
        className={`hidden md:block fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
            {product.images[0] && (
              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="40px" />
            )}
          </div>
          <h3 className="font-medium text-sm truncate flex-1">{product.name}</h3>
          <span className="text-primary font-bold text-lg">{formatPrice(currentPrice)}</span>
          <div className="flex items-center gap-2">
            {selectedColor && (
              <span className="text-xs text-neutral-400">{selectedColor}</span>
            )}
            {allSizes.map((size) => {
              const info = availableSizes.get(size);
              if (!info) return null;
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!info.inStock}
                  className={`px-3 py-1 rounded text-xs border transition ${
                    isSelected
                      ? "border-primary bg-primary/20 text-white"
                      : !info.inStock
                      ? "border-neutral-700 text-neutral-600 cursor-not-allowed"
                      : "border-neutral-600 text-neutral-300 hover:border-white"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <button
            onClick={addToCart}
            disabled={!inStock}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold text-sm transition flex-shrink-0"
          >
            AGREGAR
          </button>
        </div>
      </div>

      {/* ── Breadcrumbs ── */}
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-500">
        <ol className="flex items-center gap-1 flex-wrap">
          <li><a href="/" className="hover:text-white transition">Inicio</a></li>
          <li className="before:content-['/'] before:mx-1"><a href={`/categoria/${product.categorySlug}`} className="hover:text-white transition">{product.categoryName}</a></li>
          <li className="before:content-['/'] before:mx-1 text-neutral-400 truncate max-w-[200px] md:max-w-none">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
        {/* ══════════ LEFT: Gallery + Q&A ══════════ */}
        <div>
          <div className="space-y-3">
            {/* Main Image with Zoom */}
            <div
              ref={mainImageRef}
              className="relative aspect-square bg-transparent rounded-xl overflow-hidden cursor-crosshair"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {product.images.length > 0 ? (
                <Image
                  src={currentImage?.url || "/products/placeholder.jpg"}
                  alt={currentImage?.alt || `${product.name} - ${product.categoryName} para moto Sequoia Speed`}
                  fill
                  className={`object-cover transition-all duration-500 ${zoom ? "scale-[2.5]" : "scale-100"}`}
                  style={zoom ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">Sin imagen</div>
              )}

              {/* Prev/Next arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === 0 ? product.images.length - 1 : selectedImage - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(selectedImage === product.images.length - 1 ? 0 : selectedImage + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all duration-300 hover:bg-black/70 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {selectedImage + 1} / {product.images.length}
                </div>
              )}

              {/* Discount badge */}
              {savings && (
                <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
                  -{savings.percent}%
                </span>
              )}
            </div>

            {/* Thumbnail Carousel (below main image) */}
            {product.images.length > 1 && (
              <ThumbnailCarousel
                images={product.images}
                selectedImage={selectedImage}
                onSelect={setSelectedImage}
                productName={product.name}
              />
            )}
          </div>

          {/* ── Q&A Section (desktop only, below gallery) ── */}
          <div className="hidden md:block mt-6">
            <ProductQuestions
              productId={product.id}
              productName={product.name}
              initialQuestions={questions}
            />
          </div>
        </div>

        {/* ══════════ RIGHT: Product Info ══════════ */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            {product.reference && (
              <p className="text-xs text-neutral-500 mb-1">REF: {product.reference}</p>
            )}
            <h1 className="font-heading text-3xl lg:text-5xl leading-tight">{product.name.toUpperCase()}</h1>
            {subtitle && (
              <p className="text-base text-neutral-300 mt-2">{subtitle}</p>
            )}
            <button onClick={() => document.getElementById('reviews-section')?.scrollIntoView({behavior:'smooth'})} className="mt-2 flex">
              <Stars rating={avgRating} count={reviews.length * 8} />
            </button>
          </div>

          {/* Price + Savings */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</span>
              {savings && (
                <span className="text-lg text-neutral-500 line-through">
                  {formatPrice(savings.original)}
                </span>
              )}
            </div>
            {savings && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded">
                  AHORRAS {formatPrice(savings.saved)} ({savings.percent}%)
                </span>
              </div>
            )}
          </div>

          {/* Delivery estimate */}
          <div className="flex items-center gap-2 text-sm bg-neutral-800/50 rounded-lg px-4 py-2.5">
            <TruckIcon />
            <div>
              <span className="text-neutral-300">Entrega estimada: </span>
              <span className="text-white font-medium">Bogotá 1–2 días</span>
              <span className="text-neutral-400"> · Otras ciudades 2–4 días</span>
            </div>
          </div>

          {/* ── Benefits (visual grid) ──────── */}
          <div className="grid grid-cols-2 gap-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="bg-neutral-800/40 rounded-xl p-3 flex items-start gap-2.5">
                <HeroIcon name={b.icon} className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-200 leading-snug">{b.text}</span>
              </div>
            ))}
          </div>

          {/* ── Para quién es ──────── */}
          {product.targetAudience && product.targetAudience.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Ideal para</h3>
              <div className="flex flex-wrap gap-2">
                {product.targetAudience.map((audience, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/20">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Combo Includes ──────────────────── */}
          {comboItems && comboItems.length > 1 && (
            <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-800/30 border border-neutral-700/50 rounded-xl p-5">
              <h3 className="font-heading text-base mb-3 text-white">EL COMBO INCLUYE</h3>
              <div className="grid grid-cols-2 gap-3">
                {comboItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-neutral-800/50 rounded-lg px-3 py-2.5">
                    <HeroIcon name={item.icon} className="w-5 h-5 text-primary" />
                    <span className="text-sm text-neutral-200">{item.label}</span>
                  </div>
                ))}
              </div>
              {savings && (
                <div className="mt-3 pt-3 border-t border-neutral-700/50 text-center">
                  <span className="text-xs text-neutral-400">Valor por separado: </span>
                  <span className="text-xs text-neutral-500 line-through">{formatPrice(savings.original)}</span>
                  <span className="text-xs text-green-400 font-bold ml-2">Precio combo: {formatPrice(currentPrice)}</span>
                </div>
              )}
            </div>
          )}

          {product.humanDescription && (
            <div className="bg-neutral-800/30 rounded-xl p-4 border-l-2 border-primary">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">En pocas palabras</h3>
              <p className="text-sm text-neutral-200 leading-relaxed italic">"{product.humanDescription}"</p>
            </div>
          )}

          {product.shortDescription && (
            <div className="text-neutral-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div ref={buyZoneRef} className="space-y-4">
              {/* Stock indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {inStock ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      <span className="text-sm text-green-400 font-medium">
                        En stock — Listo para enviar
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      <span className="text-sm text-red-400">Agotado en esta combinación</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-neutral-400 hover:text-white underline underline-offset-2 transition"
                >
                  Guía de Tallas
                </button>
              </div>

              {/* Urgency indicator */}
              {inStock && stockCount > 0 && stockCount <= 10 && (
                <p className="text-xs text-amber-400 flex items-center gap-1 bg-amber-400/10 rounded-lg px-3 py-1.5">
                  <HeroIcon name="fire" className="w-4 h-4 text-red-500 inline" /> Solo quedan {stockCount} unidades en esta combinación
                </p>
              )}

              {/* Sales count urgency */}
              {product.salesCount && product.salesCount > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 rounded-lg px-3 py-1.5">
                    <HeroIcon name="fire" className="w-4 h-4 text-orange-500 inline" /> {product.salesCount} vendidos este mes
                  </span>
                  <ViewersCount />
                </div>
              )}

              {/* Color selector */}
              {hasColors && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">
                    Color: <span className="text-white">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color) => {
                      const hasStock = colorHasStock(color);
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`px-5 py-2.5 rounded-lg text-sm border-2 transition-all font-medium ${
                            isSelected
                              ? "border-primary bg-primary/20 text-white shadow-[0_0_12px_rgba(230,57,70,0.3)]"
                              : !hasStock
                              ? "border-neutral-700 text-neutral-600 cursor-not-allowed line-through"
                              : "border-neutral-600 text-neutral-300 hover:border-white hover:bg-neutral-800"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size selector */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">
                  Talla: <span className="text-white">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => {
                    const info = availableSizes.get(size);
                    if (!info) return null;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={!info.inStock}
                        className={`px-5 py-2.5 rounded-lg text-sm border-2 transition-all font-medium ${
                          isSelected
                            ? "border-primary bg-primary/20 text-white shadow-[0_0_12px_rgba(230,57,70,0.3)]"
                            : !info.inStock
                            ? "border-neutral-700 text-neutral-600 cursor-not-allowed line-through"
                            : "border-neutral-600 text-neutral-300 hover:border-white hover:bg-neutral-800"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-neutral-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded-l-lg transition text-lg"
                >
                  −
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-neutral-800 rounded-r-lg transition text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!inStock}
                className={`flex-1 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all relative overflow-hidden ${
                  inStock
                    ? addedToCart
                      ? "bg-green-600 text-white"
                      : "bg-primary hover:bg-primary-dark text-white hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] hover:scale-[1.02]"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckIcon /> Agregado al carrito
                  </span>
                ) : inStock ? (
                  "AGREGAR AL CARRITO"
                ) : (
                  "AGOTADO"
                )}
              </button>
            </div>

            {/* CTA emocional */}
            <p className="text-center text-xs text-neutral-500 italic">{ctaText}</p>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 text-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-green-600/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>

            {/* Microcopy */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
              <span className="flex items-center gap-1"><CheckIcon /> Cambios de talla gratis</span>
              <span className="flex items-center gap-1"><CheckIcon /> Envíos a todo Colombia</span>
              <span className="flex items-center gap-1"><CheckIcon /> Pago contra entrega</span>
              <span className="flex items-center gap-1"><CheckIcon /> Garantía de fábrica</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-neutral-800">
            <div className="flex flex-col items-center text-center gap-1.5">
              <TruckIcon />
              <span className="text-xs text-neutral-300">Envíos a todo el país</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <LockIcon />
              <span className="text-xs text-neutral-300">Compra segura</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <AwardIcon />
              <span className="text-xs text-neutral-300">Garantía de fábrica</span>
            </div>
          </div>

          {/* ── Storytelling ──────────────────── */}
          {storytelling && (
            <div className="bg-neutral-800/30 rounded-xl p-5 border-l-2 border-primary">
              <p className="text-sm text-neutral-300 leading-relaxed italic">{storytelling}</p>
            </div>
          )}

          {/* ── Materials & Features Visual Block ── */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-800/40 rounded-xl p-4 text-center space-y-2">
              <ShieldIcon />
              <p className="text-xs font-medium text-white">Protecciones CE</p>
              <p className="text-[11px] text-neutral-400">Certificadas removibles</p>
            </div>
            <div className="bg-neutral-800/40 rounded-xl p-4 text-center space-y-2">
              <DropIcon />
              <p className="text-xs font-medium text-white">Costuras selladas</p>
              <p className="text-[11px] text-neutral-400">Impermeabilidad real</p>
            </div>
            <div className="bg-neutral-800/40 rounded-xl p-4 text-center space-y-2">
              <FabricIcon />
              <p className="text-xs font-medium text-white">Alta resistencia</p>
              <p className="text-[11px] text-neutral-400">Lona antifricción</p>
            </div>
          </div>

          {/* ── Comparison Table ──────────────────── */}
          {(product.comparisonTable && product.comparisonTable.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="py-2 text-left text-neutral-400 font-normal">Característica</th>
                    <th className="py-2 text-center text-primary font-bold">Sequoia Speed</th>
                    <th className="py-2 text-center text-neutral-500 font-normal">Genérica</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  {product.comparisonTable.map((row, i) => (
                    <tr key={i} className="border-b border-neutral-800">
                      <td className="py-2.5">{row.feature}</td>
                      <td className="py-2.5 text-center text-green-400">{row.sequoia ? <HeroIcon name="badge" className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-neutral-600">✗</span>}</td>
                      <td className="py-2.5 text-center text-neutral-600">{row.generic ? <span className="text-neutral-500">✓</span> : <span className="text-neutral-700">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.crashProtection && (
            <div className="bg-gradient-to-br from-amber-500/5 to-red-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HeroIcon name="shield-solid" className="w-6 h-6 text-green-500" />
                <h3 className="text-base font-bold text-white">{product.crashProtection.title}</h3>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">{product.crashProtection.description}</p>
              <ul className="space-y-2">
                {product.crashProtection.protections.map((protection, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-200">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{protection}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Q&A Section (mobile only) ── */}
          <div className="md:hidden">
            <ProductQuestions
              productId={product.id}
              productName={product.name}
              initialQuestions={questions}
            />
          </div>

          {/* ── Reviews Section ──────────────────── */}
          <div id="reviews-section" className="space-y-4">
            <h3 className="font-heading text-lg">RESEÑAS DE CLIENTES</h3>

            {/* Aggregate rating */}
            <div className="flex items-start gap-6 bg-neutral-800/30 rounded-xl p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4" viewBox="0 0 20 20">
                      <path fill={s <= Math.round(avgRating) ? "#f59e0b" : "#525252"} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-1">{reviews.length} reseñas</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-400 w-3">{star}</span>
                      <svg className="w-3 h-3 text-amber-400" viewBox="0 0 20 20"><path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{width:`${pct}%`}} />
                      </div>
                      <span className="text-neutral-500 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="border border-neutral-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{review.name}</p>
                      <p className="text-xs text-neutral-500">{review.city} · Compra verificada</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 20 20">
                          <path fill={star <= review.rating ? "#f59e0b" : "#525252"} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-300 italic">&quot;{review.text}&quot;</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Description ──────────────────── */}
          {product.description && (
            <div className="border-t border-neutral-800 pt-5">
              <h3 className="font-heading text-xl mb-3">DESCRIPCIÓN</h3>
              <div
                className="text-sm text-neutral-300 space-y-2 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* ── Accordions ──────────────────── */}
          <div className="space-y-0 border-t border-neutral-800">
            {[
              {
                title: "Especificaciones Técnicas",
                content: `
                  <ul class="space-y-1.5">
                    <li><strong>Material exterior:</strong> Lona antifricción de alta resistencia</li>
                    <li><strong>Forro interior:</strong> Malla transpirable removible</li>
                    <li><strong>Protecciones:</strong> CE Nivel 2 en hombros y codos (removibles)</li>
                    <li><strong>Impermeabilidad:</strong> Membrana interna con costuras selladas</li>
                    <li><strong>Ventilación:</strong> Paneles frontales y traseros con zipper</li>
                    <li><strong>Bolsillos:</strong> 4 externos, 2 internos</li>
                    <li><strong>Reflectivos:</strong> Sí, 360°</li>
                  </ul>
                `,
              },
              {
                title: "Cuidado de la Prenda",
                content: `
                  <ul class="space-y-1.5">
                    <li>Lavar a mano con agua fría y jabón suave</li>
                    <li>No usar secadora ni plancha directa</li>
                    <li>Retirar protecciones antes del lavado</li>
                    <li>Secar a la sombra, no exponer al sol directo</li>
                    <li>Aplicar spray impermeabilizante cada 6 meses</li>
                  </ul>
                `,
              },
              {
                title: "Envíos y Cambios",
                content: `
                  <ul class="space-y-1.5">
                    <li><strong>Bogotá:</strong> Entrega en 1–2 días hábiles</li>
                    <li><strong>Otras ciudades:</strong> 2–4 días hábiles</li>
                    <li><strong>Envío gratis</strong> en compras superiores a $300.000</li>
                    <li><strong>Cambios de talla:</strong> Gratis dentro de los primeros 15 días</li>
                    <li><strong>Devoluciones:</strong> Aceptamos devoluciones en los primeros 30 días</li>
                  </ul>
                `,
              },
              {
                title: "Preguntas Frecuentes",
                content: productFaq
                  ? `<div class="space-y-3">${productFaq.map(f => `<div><p class="font-medium text-white">${f.q}</p><p>${f.a}</p></div>`).join("")}</div>`
                  : `
                  <div class="space-y-3">
                    <div>
                      <p class="font-medium text-white">¿La prenda resiste lluvia fuerte?</p>
                      <p>Sí, es 100% impermeable con costuras selladas y membrana interna.</p>
                    </div>
                    <div>
                      <p class="font-medium text-white">¿Las protecciones son removibles?</p>
                      <p>Sí, todas las protecciones CE se pueden retirar fácilmente.</p>
                    </div>
                    <div>
                      <p class="font-medium text-white">¿Tiene ventilación?</p>
                      <p>Sí, cuenta con paneles de ventilación frontales y traseros con zipper.</p>
                    </div>
                    <div>
                      <p class="font-medium text-white">¿Puedo cambiar de talla?</p>
                      <p>Sí, ofrecemos cambios de talla gratuitos dentro de los primeros 15 días.</p>
                    </div>
                  </div>
                `,
              },
            ].map((section, i) => (
              <details key={i} className="group border-b border-neutral-800">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-sm font-medium hover:text-white transition">
                  {section.title}
                  <ChevronIcon />
                </summary>
                <div
                  className="pb-4 text-sm text-neutral-400 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </details>
            ))}
          </div>

          {/* ── Trust Block ──────────────────── */}
          <div className="bg-neutral-800/30 rounded-xl p-5 space-y-2">
            <h4 className="font-medium text-sm text-white mb-2">Compra con tranquilidad</h4>
            {[
              "Pago seguro con encriptación SSL",
              "Garantía de fábrica en todos los productos",
              "Cambios de talla sin costo",
              "Envíos a toda Colombia",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                <CheckIcon />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ RELATED PRODUCTS ══════════ */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-3xl mb-6">TAMBIÉN TE PUEDE GUSTAR</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="group block transition-transform duration-300 hover:-translate-y-2">
                <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider transition-colors duration-200 group-hover:text-primary/70">{p.category}</p>
                  <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition line-clamp-2">
                    {p.name}
                  </h3>
                  <span className="text-primary font-bold">{formatPrice(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ CROSS-SELL: COMPLETA TU EQUIPO ══════════ */}
      {crossSellProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-3xl mb-2">COMPLETA TU EQUIPO</h2>
          <p className="text-neutral-400 text-sm mb-6">Complementa tu compra con estos productos esenciales</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {crossSellProducts.map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="group block transition-transform duration-300 hover:-translate-y-2">
                <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider transition-colors duration-200 group-hover:text-primary/70">{p.category}</p>
                  <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition line-clamp-2">
                    {p.name}
                  </h3>
                  <span className="text-primary font-bold">{formatPrice(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ POR QUÉ SEQUOIA SPEED ══════════ */}
      <section className="mt-16 bg-neutral-800/30 rounded-2xl p-8 border border-neutral-800">
        <h2 className="font-heading text-2xl text-center mb-8">¿POR QUÉ SEQUOIA SPEED?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "trophy", title: "+10,000", desc: "Motociclistas equipados en Colombia" },
            { icon: "beaker", title: "Certificados CE", desc: "Materiales aprobados internacionalmente" },
            { icon: "map-pin", title: "Hecho para Colombia", desc: "Diseñados para nuestro clima y vías" },
            { icon: "star", title: "4.8 / 5", desc: "Calificación promedio de clientes" },
          ].map((item, i) => (
            <div key={i} className="text-center space-y-2">
              <HeroIcon name={item.icon} className="w-8 h-8 text-primary" />
              <p className="text-lg font-bold text-white">{item.title}</p>
              <p className="text-xs text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ SEO CONTENT ══════════ */}
      {productSEOContent[product.slug] && (
        <section className="mt-12 mb-8 max-w-3xl mx-auto px-4">
          <div className="border-t border-neutral-800 pt-8">
            <p
              className="text-sm text-neutral-400 leading-relaxed [&>strong]:text-neutral-200 [&>strong]:font-medium"
              dangerouslySetInnerHTML={{ __html: productSEOContent[product.slug].paragraph }}
            />
          </div>
        </section>
      )}

      {/* ══════════ MOBILE STICKY CTA ══════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 p-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <span className="text-primary font-bold text-lg">{formatPrice(currentPrice)}</span>
        </div>
        <button
          onClick={addToCart}
          disabled={!inStock}
          className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition ${
            inStock
              ? addedToCart
                ? "bg-green-600 text-white"
                : "bg-primary hover:bg-primary-dark text-white"
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {addedToCart ? "✓ AGREGADO" : inStock ? "AGREGAR AL CARRITO" : "AGOTADO"}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="md:hidden h-20" />
    </>
  );
}
