"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  description: string;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  discountType: string;
  appliesTo: string;
  minQuantity: number;
  perCustomerUses: number | null;
  startDate: string | null;
  canCombine: boolean;
  freeShipping: boolean;
  buyXQuantity: number | null;
  getYQuantity: number | null;
  customerEligibility: string;
}

const EMPTY_FORM = {
  code: "",
  type: "percentage",
  value: 0,
  description: "",
  minPurchase: 0,
  maxUses: null as number | null,
  expiresAt: "",
  isActive: true,
  discountType: "code",
  appliesTo: "all",
  minQuantity: 0,
  perCustomerUses: null as number | null,
  startDate: "",
  canCombine: false,
  freeShipping: false,
  buyXQuantity: null as number | null,
  getYQuantity: null as number | null,
  customerEligibility: "all",
};

function formatCOP(n: number): string {
  return "$ " + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"code" | "auto">("code");

  const load = () => {
    fetch("/api/panel/coupons")
      .then((r) => r.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = coupons.filter((c) =>
    tab === "code" ? c.discountType === "code" || !c.discountType : c.discountType === "auto"
  );

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, discountType: tab === "auto" ? "auto" : "code" });
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      minPurchase: coupon.minPurchase,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      isActive: coupon.isActive,
      discountType: coupon.discountType || "code",
      appliesTo: coupon.appliesTo || "all",
      minQuantity: coupon.minQuantity || 0,
      perCustomerUses: coupon.perCustomerUses,
      startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
      canCombine: coupon.canCombine || false,
      freeShipping: coupon.freeShipping || false,
      buyXQuantity: coupon.buyXQuantity,
      getYQuantity: coupon.getYQuantity,
      customerEligibility: coupon.customerEligibility || "all",
    });
    setEditId(coupon.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || (form.type !== "buy_x_get_y" && !form.value)) {
      setError("Codigo y valor son requeridos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/panel/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editId ? { id: editId } : {}),
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          description: form.description,
          minPurchase: Number(form.minPurchase) || 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          isActive: form.isActive,
          discountType: form.discountType,
          appliesTo: form.appliesTo,
          minQuantity: Number(form.minQuantity) || 0,
          perCustomerUses: form.perCustomerUses ? Number(form.perCustomerUses) : null,
          startDate: form.startDate || null,
          canCombine: form.canCombine,
          freeShipping: form.freeShipping,
          buyXQuantity: form.buyXQuantity ? Number(form.buyXQuantity) : null,
          getYQuantity: form.getYQuantity ? Number(form.getYQuantity) : null,
          customerEligibility: form.customerEligibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error guardando cupon");
      } else {
        resetForm();
        load();
      }
    } catch {
      setError("Error de conexion");
    }
    setSaving(false);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Eliminar este cupon?")) return;
    try {
      await fetch("/api/panel/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      load();
    } catch {}
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await fetch("/api/panel/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
          minPurchase: coupon.minPurchase,
          maxUses: coupon.maxUses,
          expiresAt: coupon.expiresAt,
          isActive: !coupon.isActive,
          discountType: coupon.discountType,
          appliesTo: coupon.appliesTo,
          minQuantity: coupon.minQuantity,
          perCustomerUses: coupon.perCustomerUses,
          startDate: coupon.startDate,
          canCombine: coupon.canCombine,
          freeShipping: coupon.freeShipping,
          buyXQuantity: coupon.buyXQuantity,
          getYQuantity: coupon.getYQuantity,
          customerEligibility: coupon.customerEligibility,
        }),
      });
      load();
    } catch {}
  };

  const typeLabel = (c: Coupon) => {
    if (c.type === "buy_x_get_y") return `Compra ${c.buyXQuantity || 0} lleva ${c.getYQuantity || 0}`;
    if (c.type === "free_shipping") return "Envio gratis";
    if (c.type === "percentage") return `${c.value}%`;
    return formatCOP(c.value);
  };

  const inputClass =
    "w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none";
  const labelClass = "block text-sm text-neutral-400 mb-1.5";
  const selectClass = inputClass;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Descuentos</h1>
            <p className="text-neutral-400 mt-1 text-sm">
              Gestiona cupones y descuentos automaticos.{" "}
              {coupons.filter((c) => c.isActive).length} activos.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setForm((f) => ({ ...f, discountType: tab === "auto" ? "auto" : "code" }));
              setShowForm(true);
            }}
            className="px-4 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition"
          >
            {tab === "auto" ? "Crear descuento automatico" : "Crear codigo de descuento"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b border-neutral-800">
          {([
            { key: "code" as const, label: "Codigos de descuento" },
            { key: "auto" as const, label: "Descuentos automaticos" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowForm(false); }}
              className={`px-5 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                tab === t.key
                  ? "text-white border-white"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h3 className="text-white font-medium mb-5">{editId ? "Editar descuento" : "Nuevo descuento"}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section: Basic */}
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-3">Informacion basica</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Codigo *</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="BIENVENIDO10" className={inputClass + " uppercase font-mono"} />
                      <button type="button" onClick={() => setForm({ ...form, code: generateCode() })}
                        className="px-3 py-2.5 bg-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700 transition whitespace-nowrap">
                        Generar
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Tipo de descuento *</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={selectClass}>
                      <option value="percentage">Porcentaje</option>
                      <option value="fixed">Monto fijo</option>
                      <option value="free_shipping">Envio gratis</option>
                      <option value="buy_x_get_y">Compra X lleva Y</option>
                    </select>
                  </div>
                  {form.type !== "free_shipping" && form.type !== "buy_x_get_y" && (
                    <div>
                      <label className={labelClass}>Valor * {form.type === "percentage" ? "(%)" : "(COP)"}</label>
                      <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                        placeholder={form.type === "percentage" ? "10" : "15000"} className={inputClass} />
                    </div>
                  )}
                  {form.type === "buy_x_get_y" && (
                    <>
                      <div>
                        <label className={labelClass}>Compra (cantidad)</label>
                        <input type="number" value={form.buyXQuantity || ""} onChange={(e) => setForm({ ...form, buyXQuantity: e.target.value ? Number(e.target.value) : null })}
                          placeholder="2" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Lleva (cantidad)</label>
                        <input type="number" value={form.getYQuantity || ""} onChange={(e) => setForm({ ...form, getYQuantity: e.target.value ? Number(e.target.value) : null })}
                          placeholder="1" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Descuento sobre Y (%)</label>
                        <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                          placeholder="100" className={inputClass} />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Descripcion</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="10% de descuento para nuevos clientes" className={inputClass} />
                </div>
              </div>

              {/* Section: Conditions */}
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-3">Condiciones</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Compra minima (COP)</label>
                    <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                      placeholder="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Cantidad minima</label>
                    <input type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
                      placeholder="0" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Aplica a</label>
                    <select value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} className={selectClass}>
                      <option value="all">Todos los productos</option>
                      <option value="specific_products">Productos especificos</option>
                      <option value="specific_collections">Colecciones especificas</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Elegibilidad de clientes</label>
                    <select value={form.customerEligibility} onChange={(e) => setForm({ ...form, customerEligibility: e.target.value })} className={selectClass}>
                      <option value="all">Todos los clientes</option>
                      <option value="new_customers">Nuevos clientes</option>
                      <option value="returning_customers">Clientes recurrentes</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-4 pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-white accent-white" />
                      <span className="text-sm text-neutral-300">Incluir envio gratis</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section: Limits */}
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-3">Limites</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Usos totales</label>
                    <input type="number" value={form.maxUses || ""} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Sin limite" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Usos por cliente</label>
                    <input type="number" value={form.perCustomerUses || ""} onChange={(e) => setForm({ ...form, perCustomerUses: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Sin limite" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Fecha inicio</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Fecha fin</label>
                    <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Section: Combinations */}
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wider font-medium mb-3">Combinaciones</p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.canCombine} onChange={(e) => setForm({ ...form, canCombine: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-white accent-white" />
                  <span className="text-sm text-neutral-300">Se puede combinar con otros descuentos</span>
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm text-neutral-400 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition disabled:opacity-50">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Crear descuento"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-16 text-center">
            <p className="text-white font-medium mb-2">
              {tab === "auto" ? "No hay descuentos automaticos" : "No hay codigos de descuento"}
            </p>
            <p className="text-neutral-500 text-sm">
              {tab === "auto"
                ? "Crea un descuento automatico que se aplique sin codigo."
                : "Crea tu primer codigo de descuento para ofrecer a tus clientes."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((coupon) => (
              <div key={coupon.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`shrink-0 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${coupon.isActive ? "bg-white/10 text-white" : "bg-neutral-800 text-neutral-500"}`}>
                      {coupon.code}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{typeLabel(coupon)} de descuento</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          coupon.isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-neutral-500/15 text-neutral-500"
                        }`}>
                          {coupon.isActive ? "Activo" : "Inactivo"}
                        </span>
                        {coupon.freeShipping && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/15 text-blue-400">
                            Envio gratis
                          </span>
                        )}
                        {coupon.canCombine && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/15 text-purple-400">
                            Combinable
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500 flex-wrap">
                        {coupon.description && <span className="truncate max-w-[200px]">{coupon.description}</span>}
                        <span>Usado: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}</span>
                        {coupon.minPurchase > 0 && <span>Min: {formatCOP(coupon.minPurchase)}</span>}
                        {coupon.perCustomerUses && <span>{coupon.perCustomerUses}/cliente</span>}
                        {coupon.expiresAt && <span>Expira: {new Date(coupon.expiresAt).toLocaleDateString("es-CO")}</span>}
                        {coupon.customerEligibility !== "all" && (
                          <span>{coupon.customerEligibility === "new_customers" ? "Nuevos" : "Recurrentes"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={() => toggleActive(coupon)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${coupon.isActive ? "bg-emerald-500" : "bg-neutral-700"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${coupon.isActive ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </button>
                    <button onClick={() => startEdit(coupon)} className="p-1.5 text-neutral-500 hover:text-white transition rounded-lg hover:bg-neutral-800">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 text-neutral-500 hover:text-red-400 transition rounded-lg hover:bg-neutral-800">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
