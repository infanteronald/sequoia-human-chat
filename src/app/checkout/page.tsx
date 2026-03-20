"use client";

import { ShoppingCartIcon, FireIcon, TagIcon } from "@heroicons/react/24/outline";

import { useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import * as gtag from "@/lib/datalayer";
import Image from "next/image";
import Link from "next/link";

/* ─── Colombian Departments & Cities ─── */
const DEPARTMENTS: Record<string, string[]> = {
  Amazonas: ["Leticia", "Puerto Nariño"],
  Antioquia: ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Caucasia", "Copacabana", "Sabaneta"],
  Arauca: ["Arauca", "Saravena", "Tame"],
  Atlántico: ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia"],
  Bolívar: ["Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar"],
  Boyacá: ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa"],
  Caldas: ["Manizales", "Villamaría", "La Dorada", "Chinchiná"],
  Caquetá: ["Florencia", "San Vicente del Caguán"],
  Casanare: ["Yopal", "Aguazul", "Villanueva", "Tauramena"],
  Cauca: ["Popayán", "Santander de Quilichao", "Puerto Tejada"],
  Cesar: ["Valledupar", "Aguachica", "Codazzi"],
  Chocó: ["Quibdó", "Istmina", "Tadó"],
  Córdoba: ["Montería", "Cereté", "Lorica", "Sahagún", "Montelíbano"],
  Cundinamarca: ["Bogotá D.C.", "Soacha", "Zipaquirá", "Facatativá", "Chía", "Fusagasugá", "Girardot", "Mosquera", "Madrid", "Funza"],
  Guainía: ["Inírida"],
  Guaviare: ["San José del Guaviare"],
  Huila: ["Neiva", "Pitalito", "Garzón", "La Plata"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  Magdalena: ["Santa Marta", "Ciénaga", "Fundación", "El Banco"],
  Meta: ["Villavicencio", "Acacías", "Granada"],
  Nariño: ["Pasto", "Tumaco", "Ipiales", "La Unión"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios"],
  Putumayo: ["Mocoa", "Puerto Asís", "Orito"],
  Quindío: ["Armenia", "Calarcá", "La Tebaida", "Montenegro"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  "San Andrés": ["San Andrés", "Providencia"],
  Santander: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil"],
  Sucre: ["Sincelejo", "Corozal", "San Marcos"],
  Tolima: ["Ibagué", "Espinal", "Melgar", "Honda"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Buga", "Cartago", "Jamundí", "Yumbo"],
  Vaupés: ["Mitú"],
  Vichada: ["Puerto Carreño"],
};

/* ─── Payment Method Logos (imágenes reales de marca) ─── */
const PAYMENT_LOGOS: Record<string, string> = {
  nequi: "/payments/nequi.svg",
  bancolombia: "/payments/bancolombia.svg",
  breb: "/payments/breb.svg",
  bold: "/payments/bold.svg",
  mercadolibre: "/payments/mercadolibre.svg",
  addi: "/payments/addi.svg",
};

interface PaymentMethodConfig { id: string; name: string; config: Record<string, string> }
interface UpsellProduct { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; image: string }

const FREE_SHIPPING_THRESHOLD = 200000;
const WHATSAPP_NUMBER = "573247892412";

/* ─── Analytics Helper ─── */
// GA4 tracking now uses @/lib/gtag

/* ─── WhatsApp Cart Message Generator ─── */
function buildWhatsAppCartMessage(items: Array<{ name: string; price: number; quantity: number; variantName?: string }>, total: number) {
  let msg = "¡Hola! 👋 Me gustaría comprar estos productos:\n\n";
  items.forEach((item, i) => {
    msg += `${i + 1}. *${item.name}*`;
    if (item.variantName) msg += ` (${item.variantName})`;
    msg += ` x${item.quantity} — $${(item.price * item.quantity).toLocaleString("es-CO")}\n`;
  });
  msg += `\n💰 *Total: $${total.toLocaleString("es-CO")}*\n\n¿Está disponible? 🏍️`;
  return msg;
}

/* ─── Social proof: random viewers ─── */
function getRandomViewers() {
  return Math.floor(Math.random() * 8) + 3; // 3-10
}

/* ─── Progress Step Component ─── */
function ProgressBar({ step }: { step: number }) {
  const steps = [
    { label: "Datos", num: 1 },
    { label: "Envío", num: 2 },
    { label: "Pago", num: 3 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s.num ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-neutral-800 text-neutral-500 border border-neutral-700"}`}>
              {step > s.num ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              ) : s.num}
            </div>
            <span className={`text-[10px] mt-1 transition-colors ${step >= s.num ? "text-primary font-medium" : "text-neutral-600"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${step > s.num ? "bg-primary" : "bg-neutral-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { state, dispatch, totalPrice } = useCart();
  const submitCount = useRef(0);
  const lastSubmit = useRef(0);

  const [form, setForm] = useState({
    email: "", phone: "", whatsappOptIn: true, name: "",
    address: "", addressExtra: "",
    department: "", city: "", notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; description: string; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingCost, setShippingCost] = useState(15000);
  const [shippingDays, setShippingDays] = useState("3-5 días hábiles");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const [upsellAdded, setUpsellAdded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [abandonedSaved, setAbandonedSaved] = useState(false);
  const [viewers] = useState(getRandomViewers);
  const [currentStep, setCurrentStep] = useState(1);

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const effectiveShipping = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const total = totalPrice - discount + effectiveShipping;
  const cities = form.department ? DEPARTMENTS[form.department] || [] : [];

  // ── Determine progress step ──
  useEffect(() => {
    if (paymentMethod) { setCurrentStep(3); return; }
    if (form.department && form.city && form.address) { setCurrentStep(3); return; }
    if (form.phone && form.name) { setCurrentStep(2); return; }
    setCurrentStep(1);
  }, [form.phone, form.name, form.department, form.city, form.address, paymentMethod]);

  // ── Load saved form (localStorage) + payment methods + upsell ──
  useEffect(() => {
    const saved = localStorage.getItem("checkout-form");
    if (saved) try { setForm(JSON.parse(saved)); } catch {}

    Promise.all([
      fetch("/api/checkout/payment-methods").then(r => r.json()),
      fetch(`/api/checkout/upsell?exclude=${state.items.map(i => i.id).join(",")}`).then(r => r.json()),
    ]).then(([methods, upsell]) => {
      setPaymentMethods(methods);
      setUpsellProducts(upsell);
    }).catch(() => {}).finally(() => setLoading(false));

    // Track checkout started
    gtag.beginCheckout(state.items.map(i => ({ item_id: i.id, item_name: i.name, item_variant: i.variantName, price: i.price, quantity: i.quantity })), totalPrice);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save form (localStorage) ──
  useEffect(() => { localStorage.setItem("checkout-form", JSON.stringify(form)); }, [form]);

  // ── Fetch shipping rate when department changes ──
  useEffect(() => {
    if (!form.department) return;
    setShippingLoading(true);
    gtag.addShippingInfo(state.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })), totalPrice, "standard");
    fetch(`/api/checkout/shipping?department=${encodeURIComponent(form.department)}`)
      .then(r => r.json())
      .then(data => { setShippingCost(data.rate); setShippingDays(data.estimatedDays); })
      .catch(() => {})
      .finally(() => setShippingLoading(false));
  }, [form.department]);

  // ── Save abandoned cart when email/phone filled ──
  useEffect(() => {
    if (abandonedSaved || (!form.email && !form.phone)) return;
    if (form.phone.replace(/\D/g, "").length >= 10) {
      setAbandonedSaved(true);
      fetch("/api/checkout/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone, name: form.name, items: state.items, total: totalPrice }),
      }).catch(() => {});
    }
  }, [form.email, form.phone, form.name, abandonedSaved, state.items, totalPrice]);

  // ── Auto-detect city by timezone (simple approach) ──
  useEffect(() => {
    if (form.department) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "America/Bogota") {
        setForm(f => ({ ...f, department: "Cundinamarca", city: "Bogotá D.C." }));
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateForm = useCallback((key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  }, []);

  // ── Validate coupon ──
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/checkout/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal: totalPrice }),
      });
      const data = await res.json();
      setCouponResult(data);
    } catch {
      setCouponResult({ valid: false, discount: 0, description: "Error", code: "" });
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setCouponResult(null); setCouponCode(""); };

  // ── Add upsell to cart ──
  const addUpsell = (product: UpsellProduct) => {
    dispatch({ type: "ADD_ITEM", payload: { id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug, quantity: 1 } });
    setUpsellAdded(product.id);
    setTimeout(() => {
      setUpsellProducts(prev => prev.filter(p => p.id !== product.id));
      setUpsellAdded(null);
    }, 600);
    gtag.addToCart({ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }, product.price);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nombre requerido";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email válido requerido";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) e.phone = "Teléfono de 10 dígitos";
    if (!form.address.trim()) e.address = "Dirección requerida";
    if (!form.department) e.department = "Selecciona departamento";
    if (!form.city) e.city = "Selecciona ciudad";
    if (!paymentMethod) e.paymentMethod = "Selecciona método de pago";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastSubmit.current < 5000) return;
    submitCount.current++;
    lastSubmit.current = now;
    if (submitCount.current > 3) {
      alert("Demasiados intentos. Espera un momento.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items,
          shipping: {
            name: form.name, phone: form.phone, email: form.email,
            address: form.address + (form.addressExtra ? `, ${form.addressExtra}` : ""),
            city: form.city, state: form.department, zip: "", notes: form.notes,
            },
          paymentMethod, shippingCost: effectiveShipping,
          couponCode: couponResult?.valid ? couponResult.code : undefined,
          discount,
        }),
      });
      const data = await res.json();
      if (data.orderNumber) {
        // Track purchase
        gtag.purchase(data.orderNumber, state.items.map(i => ({ item_id: i.id, item_name: i.name, item_variant: i.variantName, price: i.price, quantity: i.quantity })), total, effectiveShipping);

        // If Addi, redirect to Addi checkout
        if (paymentMethod === "addi") {
          try {
            const addiRes = await fetch("/api/checkout/addi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderNumber,
                items: state.items,
                shipping: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, },
                total, shippingCost: effectiveShipping,
              }),
            });
            const addiData = await addiRes.json();
            if (addiData.redirectUrl) {
              dispatch({ type: "CLEAR" });
              localStorage.removeItem("checkout-form");
              window.location.href = addiData.redirectUrl;
              return;
            }
          } catch (addiErr) {
            console.error("Addi redirect error:", addiErr);
          }
        }

        dispatch({ type: "CLEAR" });
        localStorage.removeItem("checkout-form");
        const params = new URLSearchParams({ order: data.orderNumber, method: paymentMethod, total: total.toString() });
        window.location.href = `/checkout/confirmacion?${params.toString()}`;
      } else {
        alert(data.error || "Error al procesar tu pedido");
      }
    } catch {
      alert("Error al procesar tu pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPayment = paymentMethods.find(m => m.id === paymentMethod);

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="mb-6"><ShoppingCartIcon className="w-16 h-16 mx-auto text-neutral-500" /></div>
        <h1 className="font-heading text-4xl mb-4">Tu carrito está vacío</h1>
        <p className="text-neutral-400 mb-8">Agrega productos para continuar con tu compra</p>
        <Link href="/" className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition">IR A LA TIENDA</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Minimal Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><img src="/logo-sequoia.webp" alt="Sequoia Speed" width={108} height={36} className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Compra 100% segura
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <ProgressBar step={currentStep} />
      </div>

      {/* Social proof banner */}
      <div className="max-w-6xl mx-auto px-4 mb-4">
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 bg-neutral-900/50 border border-neutral-800/50 rounded-full py-1.5 px-4">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
          <span>{viewers} personas están viendo estos productos ahora</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-3 space-y-5">

            {/* ── 1. Contact ── */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                Información de contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Phone FIRST */}
                <div>
                  <div className="flex">
                    <span className="bg-neutral-700 border border-neutral-600 border-r-0 rounded-l-lg px-3 flex items-center text-sm text-neutral-400">+57</span>
                    <input type="tel" placeholder="Teléfono celular *" required value={form.phone} onChange={e => updateForm("phone", e.target.value)}
                      className={`w-full bg-neutral-800 border rounded-r-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.phone ? "border-red-500" : "border-neutral-700"}`} />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                {/* Email */}
                <div>
                  <input type="email" placeholder="Correo electrónico *" required value={form.email} onChange={e => updateForm("email", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.email ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer md:col-span-2">
                  <input type="checkbox" checked={form.whatsappOptIn} onChange={e => updateForm("whatsappOptIn", e.target.checked)} className="accent-primary w-4 h-4" />
                  Recibir descuentos y promociones
                </label>
              </div>
            </section>

            {/* ── 2. Shipping Info (COMPACT) ── */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                Datos de envío
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <input type="text" placeholder="Nombre completo *" required value={form.name} onChange={e => updateForm("name", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.name ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="md:col-span-2">
                  <input type="text" placeholder="Dirección *" required value={form.address} onChange={e => updateForm("address", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.address ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="md:col-span-2">
                  <input type="text" placeholder="Apto, torre, oficina (opcional)" value={form.addressExtra} onChange={e => updateForm("addressExtra", e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200" />
                </div>
                <div>
                  <select required value={form.department} onChange={e => { updateForm("department", e.target.value); updateForm("city", ""); }}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.department ? "border-red-500" : "border-neutral-700"} ${!form.department ? "text-neutral-500" : "text-white"}`}>
                    <option value="">Departamento *</option>
                    {Object.keys(DEPARTMENTS).sort().map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                  {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
                </div>
                <div>
                  <select required value={form.city} onChange={e => updateForm("city", e.target.value)} disabled={!form.department}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200 ${errors.city ? "border-red-500" : "border-neutral-700"} ${!form.city ? "text-neutral-500" : "text-white"} disabled:opacity-50`}>
                    <option value="">Ciudad *</option>
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="md:col-span-2">
                  <input type="text" placeholder="Notas de entrega (opcional)" value={form.notes} onChange={e => updateForm("notes", e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all duration-200" />
                </div>
              </div>
            </section>

            {/* ── 3. Shipping Method (compact) ── */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
                Método de envío
              </h2>
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 border-primary bg-primary/5">
                <input type="radio" name="shipping" defaultChecked className="accent-primary w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">Envío estándar</span>
                    {effectiveShipping === 0 && <span className="bg-green-500/20 text-green-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">GRATIS</span>}
                  </div>
                  <p className="text-xs text-neutral-400">
                    {shippingLoading ? <span className="inline-block w-24 h-3 bg-neutral-700 rounded animate-pulse" /> : `${shippingDays} a ${form.city || form.department || "toda Colombia"}`}
                  </p>
                </div>
                <span className={`font-bold text-sm transition-all duration-300 ${effectiveShipping === 0 ? "text-green-400" : "text-white"}`}>
                  {shippingLoading ? <span className="inline-block w-16 h-4 bg-neutral-700 rounded animate-pulse" /> : effectiveShipping === 0 ? "GRATIS" : formatPrice(effectiveShipping)}
                </span>
              </label>
              {/* Shipping savings message */}
              {effectiveShipping === 0 && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1 animate-fade-in">
                  🎉 Tu envío es GRATIS — ahorraste {formatPrice(shippingCost)}
                </p>
              )}
              {effectiveShipping > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-neutral-500">💡 Envío gratis en compras mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
                  <div className="mt-1.5 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-1">Te faltan {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} para envío gratis</p>
                </div>
              )}
            </section>

            {/* ── 4. Payment Method ── */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">4</span>
                Método de pago
              </h2>
              {errors.paymentMethod && <p className="text-red-400 text-xs mb-3">{errors.paymentMethod}</p>}

              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-neutral-800 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(method => {
                    const logoSrc = PAYMENT_LOGOS[method.id];
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div key={method.id}>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? "border-primary bg-primary/5 scale-[1.01]" : "border-neutral-700 hover:border-neutral-500"}`}>
                          <input type="radio" name="payment" value={method.id} checked={isSelected}
                            onChange={() => { setPaymentMethod(method.id); setErrors(e => ({ ...e, paymentMethod: "" })); gtag.addPaymentInfo(state.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })), totalPrice, method.id); }}
                            className="accent-primary w-4 h-4" />
                          {logoSrc && <img src={logoSrc} alt={method.name} width={72} height={24} className="rounded-md object-contain bg-white px-2 py-1" />}
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{method.name}</p>
                            <p className="text-[11px] text-neutral-400">
                              {method.id === "nequi" && "Pago desde tu app Nequi"}
                              {method.id === "bancolombia" && "Transferencia Bancolombia"}
                              {method.id === "breb" && "Pago inmediato con llave Bre-B"}
                              {method.id === "bold" && "Tarjeta crédito/débito"}
                              {method.id === "mercadolibre" && "Múltiples medios de pago"}
                              {method.id === "addi" && "Compra ahora, paga después — Sin tarjeta"}
                            </p>
                          </div>
                        </label>
                        {isSelected && method.config && Object.keys(method.config).length > 0 && (
                          <div className="mt-1.5 ml-10 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 text-sm space-y-2 animate-fade-in">
                            {method.id === "nequi" && method.config.nequiNumber && (
                              <><p className="text-neutral-300 text-xs">Envía el pago a:</p>
                              <div className="flex items-center gap-2"><span className="text-white font-bold text-lg">{method.config.nequiNumber}</span>
                              <button type="button" onClick={() => navigator.clipboard.writeText(method.config.nequiNumber)} className="text-primary hover:text-primary/80 text-xs">Copiar</button></div>
                              {method.config.instructions && <p className="text-neutral-400 text-xs">{method.config.instructions}</p>}</>
                            )}
                            {method.id === "bancolombia" && method.config.accountNumber && (
                              <div className="space-y-1">
                                {method.config.bankName && <p className="text-neutral-400 text-xs">Banco: <span className="text-white">{method.config.bankName}</span></p>}
                                {method.config.accountHolder && <p className="text-neutral-400 text-xs">Titular: <span className="text-white">{method.config.accountHolder}</span></p>}
                                {method.config.accountType && <p className="text-neutral-400 text-xs">Cuenta {method.config.accountType}:</p>}
                                <div className="flex items-center gap-2"><span className="text-white font-bold text-lg">{method.config.accountNumber}</span>
                                <button type="button" onClick={() => navigator.clipboard.writeText(method.config.accountNumber)} className="text-primary hover:text-primary/80 text-xs">Copiar</button></div>
                                {method.config.instructions && <p className="text-neutral-400 text-xs mt-1">{method.config.instructions}</p>}
                              </div>
                            )}
                            {method.id === "breb" && method.config.brebKey && (
                              <><p className="text-neutral-300 text-xs">Envía el pago a la llave Bre-B:</p>
                              <div className="flex items-center gap-2"><span className="text-white font-bold text-lg">{method.config.brebKey}</span>
                              <button type="button" onClick={() => navigator.clipboard.writeText(method.config.brebKey)} className="text-primary hover:text-primary/80 text-xs">Copiar</button></div>
                              {method.config.instructions && <p className="text-neutral-400 text-xs">{method.config.instructions}</p>}</>
                            )}
                            {(method.id === "bold" || method.id === "mercadolibre" || method.id === "addi") && <p className="text-neutral-400 text-xs">Serás redirigido para completar el pago de forma segura.</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {paymentMethods.length === 0 && !loading && <p className="text-neutral-500 text-sm py-4 text-center">No hay métodos de pago configurados</p>}
                </div>
              )}
            </section>

            {/* ── Upsell Section ── */}
            {upsellProducts.length > 0 && (
              <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.25s" }}>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3"><FireIcon className="w-4 h-4 inline -mt-0.5 text-orange-500" /> Clientes también llevan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {upsellProducts.map(p => (
                    <div key={p.id} className={`bg-neutral-800/50 rounded-xl p-3 flex flex-col items-center text-center group hover:bg-neutral-800 transition-all duration-300 ${upsellAdded === p.id ? "scale-95 opacity-50" : ""}`}>
                      <div className="w-14 h-14 relative rounded-lg overflow-hidden mb-2">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <p className="text-xs text-white truncate w-full">{p.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-primary font-bold text-sm">{formatPrice(p.price)}</span>
                        {p.compareAtPrice && <span className="text-neutral-500 line-through text-[10px]">{formatPrice(p.compareAtPrice)}</span>}
                      </div>
                      <button type="button" onClick={() => addUpsell(p)}
                        className="mt-2 text-[11px] bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1 rounded-full transition-all duration-200 font-medium active:scale-95">
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Submit (mobile) */}
            <div className="lg:hidden space-y-3">
              <button type="submit" disabled={submitting || !paymentMethod}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 uppercase tracking-wider text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                {submitting ? "PROCESANDO..." : `PAGAR ${formatPrice(total)}`}
              </button>

              {/* Security indicator */}
              <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Pago seguro SSL — Tus datos están protegidos
              </p>

              {/* Garantías móvil */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Cambios gratis por talla
                </span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Garantía de calidad
                </span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  Soporte WhatsApp
                </span>
              </div>

              {/* Botón WhatsApp móvil — SMALL/SECONDARY */}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppCartMessage(state.items, total))}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-2.5 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                ¿Prefieres comprar por WhatsApp?
              </a>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-white mb-3">Tu pedido</h2>

              {/* Items — con foto, talla, color */}
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
                {state.items.map(item => (
                  <div key={`${item.id}-${item.variantId}`} className="flex gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
                    <div className="w-14 h-14 relative rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700">
                      <Image src={item.image || "/products/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="56px" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-tight">{item.name}</p>
                      {item.variantName && (
                        <span className="inline-flex items-center gap-1 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded text-[10px] text-neutral-300 mt-0.5">
                          {item.variantName}
                        </span>
                      )}
                      <p className="text-xs text-neutral-500 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0 self-center">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-neutral-800 pt-3 mb-3">
                {couponResult?.valid ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-green-400 text-sm font-medium"><TagIcon className="w-4 h-4 inline -mt-0.5" /> {couponResult.code}</p>
                      <p className="text-green-400/70 text-xs">{couponResult.description}</p>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-neutral-400 hover:text-white text-xs">✕</button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setCouponOpen(!couponOpen)} className="text-sm text-neutral-400 hover:text-white transition flex items-center gap-1">
                      <TagIcon className="w-4 h-4 inline -mt-0.5" /> ¿Tienes un cupón?
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${couponOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {couponOpen && (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        <div className="flex gap-2">
                          <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Código"
                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), validateCoupon())} />
                          <button type="button" onClick={validateCoupon} disabled={couponLoading}
                            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition disabled:opacity-50">
                            {couponLoading ? "..." : "Aplicar"}
                          </button>
                        </div>
                        {couponResult && !couponResult.valid && <p className="text-red-400 text-xs">{(couponResult as any).error || "Cupón inválido"}</p>}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-400"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-neutral-400">
                  <span>Envío {form.department && <span className="text-neutral-600">({form.department})</span>}</span>
                  <span className={effectiveShipping === 0 ? "text-green-400 font-medium" : ""}>{effectiveShipping === 0 ? "GRATIS" : formatPrice(effectiveShipping)}</span>
                </div>
                {effectiveShipping === 0 && (
                  <p className="text-[10px] text-green-400/70">🎉 Ahorraste {formatPrice(shippingCost)} en envío</p>
                )}
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit (desktop) */}
              <div className="hidden lg:block mt-5">
                <button type="submit" disabled={submitting || !paymentMethod}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 uppercase tracking-wider text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {submitting ? "PROCESANDO..." : `PAGAR ${formatPrice(total)}`}
                </button>

                {/* Security indicator below pay button */}
                <p className="text-center text-xs text-neutral-500 mt-2 flex items-center justify-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Pago seguro SSL — Tus datos están protegidos
                </p>

                {/* Garantías visibles */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Cambios gratis por talla
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Garantía de calidad en todos los productos
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Soporte WhatsApp antes, durante y después
                  </div>
                </div>

                {/* Botón WhatsApp — SMALL/SECONDARY (outline) */}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppCartMessage(state.items, total))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 w-full py-2.5 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-medium rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                  ¿Prefieres comprar por WhatsApp?
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 flex-shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Pago seguro SSL</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0"><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6m4 0h2V12l-3-5h-4v10" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>Envío a toda Colombia</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500 flex-shrink-0"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>Devoluciones 30 días</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>Soporte WhatsApp</div>
              </div>

              {paymentMethods.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1.5">Métodos aceptados</p>
                  <div className="flex gap-2 flex-wrap">
                    {paymentMethods.map(m => { const src = PAYMENT_LOGOS[m.id]; if (!src) return null; return <img key={m.id} src={src} alt={m.name} width={48} height={18} className="opacity-90 rounded bg-white px-1 py-0.5" />; })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* WhatsApp Help — smaller floating button */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20necesito%20ayuda%20con%20mi%20compra`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-3 shadow-lg shadow-green-500/20 transition-transform hover:scale-110"
        title="¿Necesitas ayuda?">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
      </a>
    </div>
  );
}
