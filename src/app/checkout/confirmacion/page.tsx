"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const PAYMENT_LABELS: Record<string, { name: string; color: string; isManual: boolean }> = {
  nequi: { name: "Nequi", color: "#E6007E", isManual: true },
  bancolombia: { name: "Bancolombia", color: "#0033A0", isManual: true },
  bold: { name: "Bold", color: "#00C389", isManual: false },
  mercadolibre: { name: "MercadoLibre", color: "#2D3277", isManual: false },
  transfer: { name: "Transferencia", color: "#6B7280", isManual: true },
  breb: { name: "Llave Bre-B", color: "#00BCD4", isManual: true },
  addi: { name: "Addi", color: "#2B2178", isManual: false },
};

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const method = searchParams.get("method") || "";
  const total = searchParams.get("total") || "0";
  const [showConfetti, setShowConfetti] = useState(true);
  const paymentInfo = PAYMENT_LABELS[method];

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const whatsappMsg = encodeURIComponent(`Hola! Acabo de hacer el pedido ${orderNumber} por ${formatCOP(Number(total))}. Adjunto mi comprobante de pago.`);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="text-center mb-8 relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${Math.random() * 60}%`,
                    backgroundColor: ["#25D366", "#E6007E", "#FFE600", "#00C389", "#0033A0"][i % 5],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          )}
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">¡Pedido Confirmado!</h1>
          <p className="text-neutral-400">Tu pedido ha sido registrado exitosamente</p>
        </div>

        {/* Order Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden mb-6">
          {/* Order Number */}
          <div className="p-6 border-b border-neutral-800 text-center">
            <p className="text-sm text-neutral-500 mb-1">Número de pedido</p>
            <p className="text-2xl font-bold text-primary">{orderNumber}</p>
            <p className="text-sm text-neutral-400 mt-2">
              Total: <span className="text-white font-bold">{formatCOP(Number(total))}</span>
              {paymentInfo && (
                <span className="ml-2">
                  vía <span style={{ color: paymentInfo.color }}>{paymentInfo.name}</span>
                </span>
              )}
            </p>
          </div>

          {/* Timeline */}
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-400 mb-4">Estado del pedido</h3>
            <div className="flex items-center justify-between">
              {[
                { label: "Recibido", active: true },
                { label: "Pago", active: false },
                { label: "Preparando", active: false },
                { label: "Enviado", active: false },
                { label: "Entregado", active: false },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.active
                          ? "bg-green-500 text-white"
                          : "bg-neutral-800 text-neutral-600 border border-neutral-700"
                      }`}
                    >
                      {step.active ? "✓" : i + 1}
                    </div>
                    <p className={`text-[10px] mt-1 ${step.active ? "text-green-400" : "text-neutral-600"}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < 4 && (
                    <div className={`w-6 sm:w-10 h-0.5 mx-1 ${step.active ? "bg-green-500" : "bg-neutral-800"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions for manual payments */}
          {paymentInfo?.isManual && (
            <div className="p-6 bg-yellow-500/5 border-b border-neutral-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-white font-medium mb-1">Siguiente paso: envía tu comprobante</h3>
                  <p className="text-sm text-neutral-400">
                    Realiza el pago por {paymentInfo.name} y envía el comprobante por WhatsApp para confirmar tu pedido.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Google Review Request */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-5 mb-4">
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="text-white font-bold text-lg mb-1">¿Te gustó tu experiencia?</h3>
            <p className="text-neutral-400 text-sm mb-4">Tu opinión nos ayuda a seguir mejorando. Déjanos una reseña en Google — ¡toma menos de 1 minuto!</p>
            <a
              href="https://share.google/nmZn3w7nNgDrAlE2Y"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch("/api/checkout/review-click", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderNumber }),
                }).catch(() => {});
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl transition text-sm shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              DEJAR MI RESEÑA EN GOOGLE
            </a>
            <p className="text-neutral-500 text-xs mt-3">★★★★★ — Más de 50 motociclistas nos recomiendan</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* WhatsApp button - primary for manual payments */}
          {paymentInfo?.isManual && (
            <a
              href={`https://wa.me/573247892412?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl transition text-lg"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              ENVIAR COMPROBANTE POR WHATSAPP
            </a>
          )}

          <Link
            href="/mi-cuenta/pedidos"
            className="flex items-center justify-center w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition"
          >
            VER MIS PEDIDOS
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 rounded-xl transition"
          >
            Seguir comprando
          </Link>
        </div>

        {/* Trust footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            Te enviaremos un email con los detalles de tu pedido.
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            ¿Tienes dudas? Escríbenos por{" "}
            <a href="https://wa.me/573247892412" className="text-green-500 hover:underline">WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatCOP(n: number) {
  return "$ " + n.toLocaleString("es-CO");
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
