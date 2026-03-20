"use client";

import { useState, useEffect } from "react";

/* ─── Payment Method Metadata ─── */
const PAYMENT_META: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
    fields: { key: string; label: string; type: string; placeholder: string; options?: string[] }[];
  }
> = {
  nequi: {
    icon: (<img src="/payments/nequi.svg" alt="Nequi" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#E6007E",
    bgColor: "#E6007E15",
    description: "Pago con billetera digital Nequi. El cliente envía el pago desde su app y confirma por WhatsApp.",
    fields: [
      { key: "nequiNumber", label: "Número Nequi", type: "tel", placeholder: "3001234567" },
      { key: "instructions", label: "Instrucciones para el cliente", type: "textarea", placeholder: "Envía el pago al número indicado y comparte el comprobante por WhatsApp..." },
    ],
  },
  bancolombia: {
    icon: (<img src="/payments/bancolombia.svg" alt="Bancolombia" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#0033A0",
    bgColor: "#0033A015",
    description: "Transferencia Bancolombia. El cliente recibe los datos de la cuenta y envía comprobante.",
    fields: [
      { key: "bankName", label: "Banco", type: "text", placeholder: "Bancolombia" },
      { key: "accountHolder", label: "Titular de la cuenta", type: "text", placeholder: "Nombre del titular" },
      { key: "accountType", label: "Tipo de cuenta", type: "select", placeholder: "", options: ["Ahorros", "Corriente"] },
      { key: "accountNumber", label: "Número de cuenta", type: "text", placeholder: "000-000000-00" },
      { key: "instructions", label: "Instrucciones adicionales", type: "textarea", placeholder: "Consignar a la cuenta y enviar comprobante por WhatsApp..." },
    ],
  },
  breb: {
    icon: (<img src="/payments/breb.svg" alt="Bre-B" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#00BCD4",
    bgColor: "#00BCD415",
    description: "Llave Bre-B — Pagos inmediatos del Banco de la República. El cliente paga con su llave Bre-B.",
    fields: [
      { key: "brebKey", label: "Llave Bre-B", type: "text", placeholder: "@tunumero o número celular" },
      { key: "instructions", label: "Instrucciones para el cliente", type: "textarea", placeholder: "Envía el pago a la llave Bre-B indicada y comparte el comprobante por WhatsApp..." },
    ],
  },
  bold: {
    icon: (<img src="/payments/bold.svg" alt="Bold" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#00C389",
    bgColor: "#00C38915",
    description: "Tarjeta crédito/débito a través de Bold. Pagos seguros con procesamiento automático.",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "pk_live_..." },
      { key: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
      { key: "isLive", label: "Modo", type: "select", placeholder: "", options: ["Sandbox (pruebas)", "Producción"] },
    ],
  },
  mercadolibre: {
    icon: (<img src="/payments/mercadolibre.svg" alt="MercadoLibre" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#2D3277",
    bgColor: "#2D327715",
    description: "MercadoPago — Múltiples medios de pago. Redirige al checkout de MercadoPago.",
    fields: [
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "APP_USR-..." },
      { key: "publicKey", label: "Public Key", type: "password", placeholder: "APP_USR-..." },
      { key: "isLive", label: "Modo", type: "select", placeholder: "", options: ["Sandbox (pruebas)", "Producción"] },
    ],
  },
  transfer: {
    icon: (<img src="/payments/transfer.svg" alt="Transferencia" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#6B7280",
    bgColor: "#6B728015",
    description: "Consignación o transferencia bancaria directa. El cliente recibe los datos y envía comprobante.",
    fields: [
      { key: "bankName", label: "Banco", type: "text", placeholder: "Ej: Bancolombia, Davivienda, BBVA..." },
      { key: "accountHolder", label: "Titular de la cuenta", type: "text", placeholder: "Nombre del titular" },
      { key: "accountType", label: "Tipo de cuenta", type: "select", placeholder: "", options: ["Ahorros", "Corriente"] },
      { key: "accountNumber", label: "Número de cuenta", type: "text", placeholder: "000-000000-00" },
      { key: "documentNumber", label: "CC/NIT del titular", type: "text", placeholder: "1234567890" },
      { key: "instructions", label: "Instrucciones adicionales", type: "textarea", placeholder: "Realiza la transferencia y envía el comprobante por WhatsApp..." },
    ],
  },
  addi: {
    icon: (<img src="/payments/addi.svg" alt="Addi" width={80} height={28} className="rounded-md bg-white px-2 py-1" />),
    color: "#2B2178",
    bgColor: "#2B217815",
    description: "Addi — Compra ahora, paga después. El cliente paga en cuotas sin tarjeta de crédito.",
    fields: [
      { key: "clientId", label: "Client ID (Addi)", type: "text", placeholder: "Client ID proporcionado por Addi" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Secret proporcionado por Addi" },
      { key: "isLive", label: "Modo", type: "select", placeholder: "", options: ["Sandbox (pruebas)", "Producción"] },
    ],
  },
};

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  position: number;
}

export default function PagosPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [editConfigs, setEditConfigs] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    fetch("/api/panel/payment-methods")
      .then((r) => r.json())
      .then((data: PaymentMethod[]) => {
        setMethods(data);
        const configs: Record<string, Record<string, string>> = {};
        data.forEach((m: PaymentMethod) => {
          configs[m.id] = (m.config as Record<string, string>) || {};
        });
        setEditConfigs(configs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleEnabled = async (id: string, enabled: boolean) => {
    setSaving(id);
    try {
      await fetch("/api/panel/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, enabled } : m)));
    } catch {}
    setSaving(null);
  };

  const saveConfig = async (id: string) => {
    setSaving(id);
    try {
      await fetch("/api/panel/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, config: editConfigs[id] }),
      });
      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, config: editConfigs[id] } : m))
      );
    } catch {}
    setSaving(null);
  };

  const updateField = (methodId: string, fieldKey: string, value: string) => {
    setEditConfigs((prev) => ({
      ...prev,
      [methodId]: { ...prev[methodId], [fieldKey]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Métodos de Pago</h1>
          <p className="text-neutral-400 text-sm mt-1">Configura los métodos de pago del checkout.</p>
          <p className="text-neutral-400 mt-2">
            Configura los métodos de pago que aparecerán en el checkout de tu tienda.
          </p>
        </div>

        {/* Payment Method Cards */}
        <div className="space-y-4">
          {methods.map((method) => {
            const meta = PAYMENT_META[method.id];
            if (!meta) return null;
            const isExpanded = expandedId === method.id;
            const isSaving = saving === method.id;

            return (
              <div
                key={method.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                {/* Card Header */}
                <div className="flex items-center gap-4 p-5">
                  {/* Icon */}
                  <div className="flex-shrink-0">{meta.icon}</div>

                  {/* Name & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">{method.name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          method.enabled
                            ? "bg-green-500/20 text-green-400"
                            : "bg-neutral-700/50 text-neutral-500"
                        }`}
                      >
                        {method.enabled ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-sm mt-0.5 truncate">{meta.description}</p>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleEnabled(method.id, !method.enabled)}
                    disabled={isSaving}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      method.enabled ? "bg-green-500" : "bg-neutral-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        method.enabled ? "translate-x-[26px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Expand button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : method.id)}
                    className="text-neutral-500 hover:text-white transition p-1"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Config Panel */}
                {isExpanded && (
                  <div className="border-t border-neutral-800 p-5 bg-neutral-900">
                    <div className="space-y-4">
                      {meta.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm text-neutral-400 mb-1.5 font-medium">
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              value={editConfigs[method.id]?.[field.key] || ""}
                              onChange={(e) => updateField(method.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none placeholder:text-neutral-600 resize-none"
                            />
                          ) : field.type === "select" ? (
                            <select
                              value={editConfigs[method.id]?.[field.key] || ""}
                              onChange={(e) => updateField(method.id, field.key, e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
                            >
                              <option value="">Seleccionar...</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              value={editConfigs[method.id]?.[field.key] || ""}
                              onChange={(e) => updateField(method.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none placeholder:text-neutral-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
                      <button
                        onClick={() => setExpandedId(null)}
                        className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveConfig(method.id)}
                        disabled={isSaving}
                        className="px-6 py-2 bg-white hover:bg-neutral-200 text-neutral-900 text-sm font-medium rounded-lg transition disabled:opacity-50"
                      >
                        {isSaving ? "Guardando..." : "Guardar configuración"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Note */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-white font-medium flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            ¿Cómo funciona?
          </h3>
          <ul className="text-sm text-neutral-500 space-y-1.5 ml-6 list-disc">
            <li>Activa los métodos de pago que quieres ofrecer en tu tienda.</li>
            <li>Configura los datos necesarios para cada método (cuentas bancarias, API keys, etc.).</li>
            <li>Los métodos activos aparecerán automáticamente en el checkout.</li>
            <li>Para Nequi, Bancolombia y Transferencia: el cliente verá tus datos y enviará el comprobante por WhatsApp.</li>
            <li>Para Bold y MercadoLibre: el pago se procesará automáticamente cuando configures las API keys.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

