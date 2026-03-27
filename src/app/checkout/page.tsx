"use client";

import { ShoppingCartIcon, FireIcon, TagIcon, TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
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

const PAYMENT_LOGOS: Record<string, string> = {
  nequi: "/payments/nequi.svg",
  bancolombia: "/payments/bancolombia.svg",
  breb: "/payments/breb.svg",
  bold: "/payments/bold.svg",
  mercadolibre: "/payments/mercadolibre.svg",
  addi: "/payments/addi.svg",
  "bancolombia-button": "/payments/bancolombia-button.svg",
};

interface PaymentMethodConfig { id: string; name: string; config: Record<string, string> }
interface UpsellProduct { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; image: string }

const FREE_SHIPPING_THRESHOLD = 200000;
const WHATSAPP_NUMBER = "573247892412";

function buildWhatsAppCartMessage(items: Array<{ name: string; price: number; quantity: number; variantName?: string }>, total: number) {
  let msg = "¡Hola! Me gustaría comprar estos productos:\n\n";
  items.forEach((item, i) => {
    msg += `${i + 1}. *${item.name}*`;
    if (item.variantName) msg += ` (${item.variantName})`;
    msg += ` x${item.quantity} — $${(item.price * item.quantity).toLocaleString("es-CO")}\n`;
  });
  msg += `\n*Total: $${total.toLocaleString("es-CO")}*\n\n¿Está disponible?`;
  return msg;
}

const PAYMENT_DESC: Record<string, string> = {
  nequi: "Paga directo desde tu app Nequi",
  bancolombia: "Paga con tu cuenta Bancolombia",
  breb: "Pago inmediato con Bre-B",
  bold: "Visa, Mastercard, Amex, PSE",
  mercadolibre: "Múltiples medios de pago",
  addi: "Compra ahora, paga después — Sin tarjeta",
};

export default function CheckoutPage() {
  const { state, dispatch, totalPrice } = useCart();
  const submitCount = useRef(0);
  const lastSubmit = useRef(0);

  const [form, setForm] = useState({ email: "", phone: "", name: "", address: "", department: "", city: "" });
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
  const [summaryOpen, setSummaryOpen] = useState(false);

  const discount = couponResult?.valid ? couponResult.discount : 0;
  // Digital products (reserva) don't need shipping
  const DIGITAL_SLUGS = ["reserva-de-producto"];
  const allDigital = state.items.every(item => DIGITAL_SLUGS.includes(item.slug));
  const effectiveShipping = allDigital ? 0 : (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost);
  const total = totalPrice - discount + effectiveShipping;
  const cities = form.department ? DEPARTMENTS[form.department] || [] : [];

  // ── Load saved form + payment methods + upsell ──
  useEffect(() => {
    const saved = localStorage.getItem("checkout-form");
    if (saved) try {
      const parsed = JSON.parse(saved);
      setForm({ email: parsed.email || "", phone: parsed.phone || "", name: parsed.name || "", address: parsed.address || (parsed.addressExtra ? `${parsed.address || ""}, ${parsed.addressExtra}` : ""), department: parsed.department || "", city: parsed.city || "" });
    } catch {}

    Promise.all([
      fetch("/api/checkout/payment-methods").then(r => r.json()),
      fetch(`/api/checkout/upsell?exclude=${state.items.map(i => i.id).join(",")}`).then(r => r.json()),
    ]).then(([methods, upsell]) => {
      setPaymentMethods(methods);
      setUpsellProducts(upsell);
    }).catch(() => {}).finally(() => setLoading(false));

    gtag.beginCheckout(state.items.map(i => ({ item_id: i.id, item_name: i.name, item_variant: i.variantName, price: i.price, quantity: i.quantity })), totalPrice);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save form ──
  useEffect(() => { localStorage.setItem("checkout-form", JSON.stringify(form)); }, [form]);

  // ── Fetch shipping rate ──
  useEffect(() => {
    if (!form.department) return;
    setShippingLoading(true);
    gtag.addShippingInfo(state.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })), totalPrice, "standard");
    fetch(`/api/checkout/shipping?department=${encodeURIComponent(form.department)}`)
      .then(r => r.json())
      .then(data => { setShippingCost(data.rate); setShippingDays(data.estimatedDays); })
      .catch(() => {})
      .finally(() => setShippingLoading(false));
  }, [form.department]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save abandoned cart ──
  useEffect(() => {
    if (abandonedSaved || (!form.email && !form.phone)) return;
    if (form.phone.replace(/\D/g, "").length >= 10) {
      setAbandonedSaved(true);
      fetch("/api/checkout/abandoned", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone, name: form.name, items: state.items, total: totalPrice }),
      }).catch(() => {});
    }
  }, [form.email, form.phone, form.name, abandonedSaved, state.items, totalPrice]);

  // ── Auto-detect Bogotá ──
  useEffect(() => {
    if (form.department) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "America/Bogota") setForm(f => ({ ...f, department: "Cundinamarca", city: "Bogotá D.C." }));
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateForm = useCallback((key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/checkout/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal: totalPrice }) });
      setCouponResult(await res.json());
    } catch { setCouponResult({ valid: false, discount: 0, description: "Error", code: "" }); }
    setCouponLoading(false);
  };

  const removeCoupon = () => { setCouponResult(null); setCouponCode(""); };

  const addUpsell = (product: UpsellProduct) => {
    dispatch({ type: "ADD_ITEM", payload: { id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug, quantity: 1 } });
    setUpsellAdded(product.id);
    setTimeout(() => { setUpsellProducts(prev => prev.filter(p => p.id !== product.id)); setUpsellAdded(null); }, 600);
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
    const now = Date.now();
    if (now - lastSubmit.current < 5000) return;
    submitCount.current++;
    lastSubmit.current = now;
    if (submitCount.current > 3) { alert("Demasiados intentos. Espera un momento."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items,
          shipping: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, state: form.department, zip: "", notes: "" },
          paymentMethod, shippingCost: effectiveShipping,
          couponCode: couponResult?.valid ? couponResult.code : undefined, discount,
        }),
      });
      const data = await res.json();
      if (data.orderNumber) {
        gtag.purchase(data.orderNumber, state.items.map(i => ({ item_id: i.id, item_name: i.name, item_variant: i.variantName, price: i.price, quantity: i.quantity })), total, effectiveShipping);

        // ADDI flow
        if (paymentMethod === "addi") {
          try {
            const addiRes = await fetch("/api/checkout/addi", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderNumber, items: state.items, shipping: { name: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city }, total, shippingCost: effectiveShipping }),
            });
            const addiData = await addiRes.json();
            if (addiData.redirectUrl) { dispatch({ type: "CLEAR" }); localStorage.removeItem("checkout-form"); window.location.href = addiData.redirectUrl; return; }
          } catch (addiErr) { console.error("Addi redirect error:", addiErr); }
        }

        // Bold flow (bold, nequi, bancolombia, breb)
        const boldMethods = ["bold", "nequi", "bancolombia", "breb", "bancolombia-button"];
        if (boldMethods.includes(paymentMethod)) {
          try {
            const boldRes = await fetch("/api/checkout/bold", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderNumber: data.orderNumber, amount: total, description: `Pedido ${data.orderNumber} - Sequoia Speed`, customerData: { email: form.email, fullName: form.name, phone: form.phone } }),
            });
            const boldData = await boldRes.json();
            if (boldData.orderId) {
              // Don't clear cart yet - only clear after confirmed payment
              localStorage.setItem("pending-order", data.orderNumber);
              const script = document.createElement("script");
              script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
              const boldTimeout = setTimeout(() => { alert("Error cargando Bold. Serás redirigido."); window.location.href = "/checkout/confirmacion?order=" + data.orderNumber + "&method=bold&total=" + total; }, 10000);
              script.onerror = () => { clearTimeout(boldTimeout); alert("No se pudo cargar Bold. Intenta otro método."); window.location.href = "/checkout/confirmacion?order=" + data.orderNumber + "&method=bold&total=" + total; };
              script.onload = () => {
                clearTimeout(boldTimeout);
                try {
                  const checkout = new (window as any).BoldCheckout({
                    orderId: boldData.orderId,
                    currency: boldData.currency,
                    amount: boldData.amount,
                    apiKey: boldData.apiKey,
                    integritySignature: boldData.integritySignature,
                    description: boldData.description,
                    redirectionUrl: boldData.redirectionUrl,
                    renderMode: "embedded",
                  });
                  // Listen for Bold window close (rejected/cancelled)
                  const checkBoldClosed = setInterval(() => {
                    const boldFrame = document.querySelector("iframe[src*='bold']");
                    if (!boldFrame && !window.location.href.includes("bold-resultado")) {
                      clearInterval(checkBoldClosed);
                      alert("El pago no se completó. Tu carrito se conserva para que puedas intentar de nuevo.");
                      setLoading(false);
                    }
                  }, 1000);
                  checkout.open();
                } catch (sdkErr) { console.error("BoldCheckout SDK error:", sdkErr); window.location.href = "/checkout/confirmacion?order=" + data.orderNumber + "&method=bold&total=" + total; }
              };
              document.head.appendChild(script);
              return;
            }
          } catch (boldErr) { console.error("Bold checkout error:", boldErr); }
        }

        // Confirmacion redirect (fallback / other methods)
        dispatch({ type: "CLEAR" }); localStorage.removeItem("checkout-form");
        const params = new URLSearchParams({ order: data.orderNumber, method: paymentMethod, total: total.toString() });
        window.location.href = `/checkout/confirmacion?${params.toString()}`;
      } else { alert(data.error || "Error al procesar tu pedido"); }
    } catch { alert("Error al procesar tu pedido. Intenta de nuevo."); }
    finally { setSubmitting(false); }
  }

  // ── Empty cart ──
  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <ShoppingCartIcon className="w-16 h-16 mx-auto text-neutral-500 mb-6" />
        <h1 className="font-heading text-4xl mb-4">Tu carrito está vacío</h1>
        <p className="text-neutral-400 mb-8">Agrega productos para continuar con tu compra</p>
        <Link href="/" className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition">IR A LA TIENDA</Link>
      </div>
    );
  }

  const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
  const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header removed for cleaner checkout */}

      {/* Mobile order summary toggle */}
      <div className="md:hidden border-b border-neutral-800 bg-neutral-900/30">
        <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} className="w-full px-4 py-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-neutral-300">
            <ShoppingCartIcon className="w-5 h-5" />
            {summaryOpen ? "Ocultar resumen" : "Ver resumen del pedido"} ({state.items.length})
          </span>
          <span className="text-primary font-bold">{formatPrice(total)}</span>
        </button>
        {summaryOpen && (
          <div className="px-4 pb-4 space-y-2 animate-fade-in">
            {state.items.map(item => (
              <div key={`${item.id}-${item.variantId}`} className="flex gap-3 items-center">
                <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800"><Image src={item.image || "/products/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="48px" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  {item.variantName && <span className="text-[10px] text-neutral-400">{item.variantName}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, variantId: item.variantId, quantity: Math.max(1, item.quantity - 1) } })} className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"><MinusIcon className="w-3 h-3" /></button>
                  <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, variantId: item.variantId, quantity: item.quantity + 1 } })} className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"><PlusIcon className="w-3 h-3" /></button>
                </div>
                <p className="text-sm font-bold text-white w-20 text-right">{formatPrice(item.price * item.quantity)}</p>
                <button type="button" onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, variantId: item.variantId } })} className="text-neutral-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* ═══ LEFT COLUMN — Form ═══ */}
          <div className="md:col-span-3 space-y-5">
            {/* Contacto */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex">
                    <span className="bg-neutral-700 border border-neutral-600 border-r-0 rounded-l-lg px-3 flex items-center text-sm text-neutral-400">+57</span>
                    <input type="tel" name="phone" autoComplete="tel-national" placeholder="Teléfono celular *" required value={form.phone} onChange={e => updateForm("phone", e.target.value)}
                      className={`w-full bg-neutral-800 border rounded-r-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.phone ? "border-red-500" : "border-neutral-700"}`} />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <input type="email" name="email" autoComplete="email" placeholder="Correo electrónico *" required value={form.email} onChange={e => updateForm("email", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.email ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </section>

            {/* Envío */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <input type="text" name="name" autoComplete="name" placeholder="Nombre completo *" required value={form.name} onChange={e => updateForm("name", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.name ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input type="text" name="address" autoComplete="street-address" placeholder="Dirección completa (apto, torre, etc.) *" required value={form.address} onChange={e => updateForm("address", e.target.value)}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.address ? "border-red-500" : "border-neutral-700"}`} />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <select name="department" autoComplete="address-level1" required value={form.department} onChange={e => { updateForm("department", e.target.value); updateForm("city", ""); }}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.department ? "border-red-500" : "border-neutral-700"} ${!form.department ? "text-neutral-500" : "text-white"}`}>
                    <option value="">Departamento *</option>
                    {Object.keys(DEPARTMENTS).sort().map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                  {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department}</p>}
                </div>
                <div>
                  <select name="city" autoComplete="address-level2" required value={form.city} onChange={e => updateForm("city", e.target.value)} disabled={!form.department}
                    className={`w-full bg-neutral-800 border rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none ${errors.city ? "border-red-500" : "border-neutral-700"} ${!form.city ? "text-neutral-500" : "text-white"} disabled:opacity-50`}>
                    <option value="">Ciudad *</option>
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>
              {/* Shipping info inline */}
              {form.department && (
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400 bg-neutral-800/50 rounded-lg px-3 py-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0"><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6m4 0h2V12l-3-5h-4v10" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                  {shippingLoading ? <span className="w-32 h-3 bg-neutral-700 rounded animate-pulse" /> : (
                    <span>{shippingDays} a {form.city || form.department} — {effectiveShipping === 0 ? <span className="text-green-400 font-medium">GRATIS</span> : formatPrice(effectiveShipping)}</span>
                  )}
                </div>
              )}
              {effectiveShipping > 0 && totalPrice < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-2">
                  <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-primary h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">Te faltan {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} para envío gratis</p>
                </div>
              )}
            </section>

            {/* Pago */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Pago</h2>
              {errors.paymentMethod && <p className="text-red-400 text-xs mb-2">{errors.paymentMethod}</p>}
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-neutral-800 rounded-lg animate-pulse" />)}</div>
              ) : (
                <div className="space-y-1.5">
                  {paymentMethods.map(method => {
                    const logoSrc = PAYMENT_LOGOS[method.id];
                    const isSelected = paymentMethod === method.id;
                    return (
                      <label key={method.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5" : "border-neutral-700/50 hover:border-neutral-600"}`}>
                        <input type="radio" name="payment" value={method.id} checked={isSelected}
                          onChange={() => { setPaymentMethod(method.id); setErrors(e => ({ ...e, paymentMethod: "" })); gtag.addPaymentInfo(state.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })), totalPrice, method.id); }}
                          className="accent-primary w-4 h-4" />
                        {logoSrc && <img src={logoSrc} alt={method.name} width={56} height={20} className="rounded object-contain bg-white px-1.5 py-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm">{method.name}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{PAYMENT_DESC[method.id] || ""}</p>
                        </div>
                      </label>
                    );
                  })}
                  {paymentMethods.length === 0 && !loading && <p className="text-neutral-500 text-sm py-4 text-center">No hay métodos de pago configurados</p>}
                </div>
              )}
            </section>

            {/* Cupón */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              {couponResult?.valid ? (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                  <div><p className="text-green-400 text-sm font-medium"><TagIcon className="w-4 h-4 inline -mt-0.5" /> {couponResult.code}</p><p className="text-green-400/70 text-xs">{couponResult.description}</p></div>
                  <button type="button" onClick={removeCoupon} className="text-neutral-400 hover:text-white text-xs">✕</button>
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => setCouponOpen(!couponOpen)} className="text-sm text-neutral-400 hover:text-white transition flex items-center gap-1">
                    <TagIcon className="w-4 h-4" /> ¿Tienes un cupón?
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${couponOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {couponOpen && (
                    <div className="mt-2 flex gap-2 animate-fade-in">
                      <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Código"
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), validateCoupon())} />
                      <button type="button" onClick={validateCoupon} disabled={couponLoading} className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition disabled:opacity-50">{couponLoading ? "..." : "Aplicar"}</button>
                    </div>
                  )}
                  {couponResult && !couponResult.valid && <p className="text-red-400 text-xs mt-1">{(couponResult as any).error || "Cupón inválido"}</p>}
                </>
              )}
            </section>
          </div>

          {/* ═══ RIGHT COLUMN — Order Summary (sticky) ═══ */}
          <div className="hidden md:block md:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:sticky md:top-20">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Tu pedido</h2>

              {/* Cart items with qty controls */}
              <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
                {state.items.map(item => (
                  <div key={`${item.id}-${item.variantId}`} className="flex gap-2.5 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
                    <div className="w-14 h-14 relative rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700">
                      <Image src={item.image || "/products/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium leading-tight truncate">{item.name}</p>
                      {item.variantName && <span className="text-[10px] text-neutral-400">{item.variantName}</span>}
                      <div className="flex items-center gap-1.5 mt-1">
                        <button type="button" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, variantId: item.variantId, quantity: Math.max(1, item.quantity - 1) } })} className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white text-xs">-</button>
                        <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                        <button type="button" onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, variantId: item.variantId, quantity: item.quantity + 1 } })} className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white text-xs">+</button>
                        <button type="button" onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, variantId: item.variantId } })} className="ml-auto text-neutral-600 hover:text-red-400"><TrashIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0 self-start">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-neutral-400"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-400"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-neutral-400">
                  <span>Envío</span>
                  <span className={effectiveShipping === 0 ? "text-green-400 font-medium" : ""}>{effectiveShipping === 0 ? "GRATIS" : formatPrice(effectiveShipping)}</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* PAGAR button */}
              <button type="submit" disabled={submitting || !paymentMethod}
                className="w-full mt-4 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all uppercase tracking-wider text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                {submitting ? "PROCESANDO..." : `PAGAR ${formatPrice(total)}`}
              </button>
              <p className="text-center text-xs text-neutral-500 mt-2 flex items-center justify-center gap-1"><LockIcon /> Pago seguro SSL</p>

              {/* WhatsApp */}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppCartMessage(state.items, total))}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 w-full py-2 border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 font-medium rounded-lg transition text-xs flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                ¿Prefieres comprar por WhatsApp?
              </a>

              {/* Trust badges */}
              <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><CheckIcon /> Pago seguro SSL</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><CheckIcon /> Envío a toda Colombia</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><CheckIcon /> Devoluciones 30 días</div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500"><CheckIcon /> Soporte WhatsApp</div>
              </div>

              {/* Payment logos */}
              {paymentMethods.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-800">
                  <div className="flex gap-1.5 flex-wrap">
                    {paymentMethods.map(m => { const src = PAYMENT_LOGOS[m.id]; if (!src) return null; return <img key={m.id} src={src} alt={m.name} width={40} height={16} className="opacity-80 rounded bg-white px-1 py-0.5" />; })}
                  </div>
                </div>
              )}

              {/* Recomendado para ti */}
              {upsellProducts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1"><FireIcon className="w-3.5 h-3.5 text-orange-500" /> Clientes también llevan</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {upsellProducts.slice(0, 4).map(p => (
                      <div key={p.id} className={`bg-neutral-800/50 rounded-lg p-2 flex flex-col items-center text-center transition-all ${upsellAdded === p.id ? "scale-95 opacity-50" : ""}`}>
                        <div className="w-14 h-14 relative rounded overflow-hidden mb-1"><Image src={p.image} alt={p.name} fill className="object-cover" /></div>
                        <p className="text-xs text-white truncate w-full">{p.name}</p>
                        <span className="text-primary font-bold text-xs">{formatPrice(p.price)}</span>
                        <button type="button" onClick={() => addUpsell(p)} className="mt-1 text-[10px] bg-primary/20 hover:bg-primary/30 text-primary px-2 py-0.5 rounded-full font-medium">+ Agregar</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Mobile fixed PAGAR button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 p-3 safe-area-bottom">
        <button type="button" onClick={(e) => { const form = document.querySelector("form"); if (form) form.requestSubmit(); }} disabled={submitting || !paymentMethod}
          className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all uppercase tracking-wider text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
          {submitting ? "PROCESANDO..." : `PAGAR ${formatPrice(total)}`}
        </button>
      </div>

      {/* WhatsApp floating help */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20necesito%20ayuda%20con%20mi%20compra`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full p-2.5 shadow-lg shadow-green-500/20 transition-transform hover:scale-110" title="¿Necesitas ayuda?">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
      </a>
    </div>
  );
}
