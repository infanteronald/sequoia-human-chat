"use client";

import { useState, useEffect, useCallback } from "react";

interface Preset {
  key: string;
  name: string;
  description: string;
  count: number;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  rules: Rule[];
  customer_count: number;
  auto_update: boolean;
  created_at: string;
  updated_at: string;
}

interface Rule {
  field: string;
  operator: string;
  value: string;
}

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

const FIELDS = [
  { value: "total_spent", label: "Gasto total" },
  { value: "order_count", label: "Cantidad de pedidos" },
  { value: "last_order_date", label: "Último pedido" },
  { value: "created_at", label: "Fecha de registro" },
];

const OPERATORS = [
  { value: ">", label: "Mayor que" },
  { value: "<", label: "Menor que" },
  { value: "=", label: "Igual a" },
  { value: "contains", label: "Contiene" },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SegmentosPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRules, setFormRules] = useState<Rule[]>([{ field: "total_spent", operator: ">", value: "" }]);
  const [formAutoUpdate, setFormAutoUpdate] = useState(true);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Customer list view
  const [viewMode, setViewMode] = useState<"list" | "customers">("list");
  const [viewTitle, setViewTitle] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [custTotal, setCustTotal] = useState(0);
  const [custPage, setCustPage] = useState(1);
  const [custPages, setCustPages] = useState(1);
  const [custLoading, setCustLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [presetsRes, segmentsRes] = await Promise.all([
      fetch("/api/panel/segments?action=presets"),
      fetch("/api/panel/segments"),
    ]);
    const presetsData = await presetsRes.json();
    const segmentsData = await segmentsRes.json();
    setPresets(presetsData.presets || []);
    setSegments(segmentsData.segments || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePreview = async () => {
    const validRules = formRules.filter(r => r.value.trim());
    const res = await fetch(`/api/panel/segments?action=preview&rules=${encodeURIComponent(JSON.stringify(validRules))}`);
    const data = await res.json();
    setPreviewCount(data.count);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    const validRules = formRules.filter(r => r.value.trim());
    await fetch("/api/panel/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName, description: formDesc, rules: validRules, auto_update: formAutoUpdate }),
    });
    setSaving(false);
    setShowForm(false);
    setFormName("");
    setFormDesc("");
    setFormRules([{ field: "total_spent", operator: ">", value: "" }]);
    setPreviewCount(null);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este segmento?")) return;
    await fetch(`/api/panel/segments?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const viewCustomers = async (title: string, params: string, page = 1) => {
    setCustLoading(true);
    setViewTitle(title);
    setViewMode("customers");
    setCustPage(page);
    const res = await fetch(`/api/panel/segments?action=customers&${params}&page=${page}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setCustTotal(data.total || 0);
    setCustPages(data.pages || 1);
    setCustLoading(false);
  };

  const addRule = () => setFormRules([...formRules, { field: "total_spent", operator: ">", value: "" }]);
  const removeRule = (i: number) => setFormRules(formRules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, key: keyof Rule, val: string) => {
    const updated = [...formRules];
    updated[i] = { ...updated[i], [key]: val };
    setFormRules(updated);
  };

  if (viewMode === "customers") {
    return (
      <div className="min-h-screen bg-neutral-950 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setViewMode("list")} className="text-neutral-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Volver a segmentos
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white">{viewTitle}</h1>
              <p className="text-neutral-400 text-sm mt-1">{custTotal} clientes</p>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {custLoading ? (
              <div className="p-12 text-center text-neutral-500">Cargando...</div>
            ) : customers.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">No hay clientes en este segmento</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Email</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Pedidos</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Gasto total</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Último pedido</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-white">{c.name || "Sin nombre"}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-400">{c.email}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300 text-right">{c.order_count}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-300 text-right">{formatCurrency(Number(c.total_spent))}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-400 text-right">{formatDate(c.last_order_date)}</td>
                      <td className="px-5 py-3.5 text-sm text-neutral-400 text-right">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {custPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={custPage <= 1} onClick={() => viewCustomers(viewTitle, new URLSearchParams(window.location.search).toString(), custPage - 1)} className="px-3 py-1.5 text-sm bg-neutral-800 text-neutral-300 rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors">Anterior</button>
              <span className="text-sm text-neutral-500">Página {custPage} de {custPages}</span>
              <button disabled={custPage >= custPages} onClick={() => viewCustomers(viewTitle, new URLSearchParams(window.location.search).toString(), custPage + 1)} className="px-3 py-1.5 text-sm bg-neutral-800 text-neutral-300 rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors">Siguiente</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-white">Segmentos de Clientes</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-white text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors">
            {showForm ? "Cancelar" : "Crear segmento"}
          </button>
        </div>

        {/* Create Segment Form */}
        {showForm && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-medium text-white mb-5">Nuevo segmento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Nombre</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej: Clientes premium" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Descripción</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descripción opcional" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors" />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-neutral-400 mb-3">Reglas (todas deben cumplirse)</label>
              <div className="space-y-3">
                {formRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <select value={rule.field} onChange={e => updateRule(i, "field", e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors">
                      {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <select value={rule.operator} onChange={e => updateRule(i, "operator", e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors">
                      {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input value={rule.value} onChange={e => updateRule(i, "value", e.target.value)} placeholder={rule.field.includes("date") || rule.field === "created_at" ? "YYYY-MM-DD" : "Valor"} className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors" />
                    {formRules.length > 1 && (
                      <button onClick={() => removeRule(i)} className="text-neutral-500 hover:text-red-400 transition-colors p-1">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addRule} className="mt-3 text-sm text-neutral-400 hover:text-white transition-colors">+ Agregar regla</button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                <input type="checkbox" checked={formAutoUpdate} onChange={e => setFormAutoUpdate(e.target.checked)} className="rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0" />
                Actualización automática
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handlePreview} className="bg-neutral-800 text-neutral-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors">
                Vista previa
              </button>
              {previewCount !== null && (
                <span className="text-sm text-neutral-400">{previewCount} clientes coinciden</span>
              )}
              <div className="flex-1" />
              <button onClick={handleSave} disabled={saving || !formName.trim()} className="bg-white text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 transition-colors">
                {saving ? "Guardando..." : "Guardar segmento"}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-neutral-500">Cargando segmentos...</div>
        ) : (
          <>
            {/* Preset Segments */}
            <div className="mb-10">
              <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Segmentos predefinidos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {presets.map((p) => (
                  <button key={p.key} onClick={() => viewCustomers(p.name, `preset=${p.key}`)} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-left hover:border-neutral-700 transition-colors group">
                    <p className="text-sm font-medium text-white group-hover:text-white/90">{p.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{p.description}</p>
                    <p className="text-2xl font-semibold text-white mt-3">{p.count.toLocaleString("es-CO")}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Segments */}
            {segments.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Segmentos personalizados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {segments.map((s) => (
                    <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 group">
                      <div className="flex items-start justify-between">
                        <button onClick={() => viewCustomers(s.name, `segmentId=${s.id}`)} className="text-left flex-1">
                          <p className="text-sm font-medium text-white">{s.name}</p>
                          {s.description && <p className="text-xs text-neutral-500 mt-1">{s.description}</p>}
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2 p-1">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                        <p className="text-2xl font-semibold text-white">{s.customer_count.toLocaleString("es-CO")}</p>
                        {s.auto_update && (
                          <span className="text-[10px] uppercase tracking-wider bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">Auto</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
