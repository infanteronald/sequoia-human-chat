"use client";

import { useState, useEffect } from "react";

interface ShippingRate {
  id: string;
  department: string;
  rate: number;
  estimatedDays: string;
  isActive: boolean;
}

export default function EnviosPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editDays, setEditDays] = useState("");

  useEffect(() => {
    fetch("/api/panel/shipping")
      .then((r) => r.json())
      .then((data) => {
        setRates(data.map((r: any) => ({ ...r, rate: Number(r.rate) })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (dept: string, isActive: boolean) => {
    setSaving(dept);
    try {
      await fetch("/api/panel/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: dept, isActive }),
      });
      setRates((prev) => prev.map((r) => (r.department === dept ? { ...r, isActive } : r)));
    } catch {}
    setSaving(null);
  };

  const startEdit = (rate: ShippingRate) => {
    setEditingId(rate.department);
    setEditRate(rate.rate.toString());
    setEditDays(rate.estimatedDays);
  };

  const saveEdit = async (dept: string) => {
    setSaving(dept);
    try {
      await fetch("/api/panel/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: dept, rate: Number(editRate), estimatedDays: editDays }),
      });
      setRates((prev) =>
        prev.map((r) =>
          r.department === dept ? { ...r, rate: Number(editRate), estimatedDays: editDays } : r
        )
      );
      setEditingId(null);
    } catch {}
    setSaving(null);
  };

  const formatPrice = (n: number) => "$ " + n.toLocaleString("es-CO");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = rates.filter((r) => r.isActive).length;

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Tarifas de Envío</h1>
          <p className="text-neutral-400 text-sm mt-1">Configura las tarifas por departamento. {activeCount} de {rates.length} activos.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Departamentos</p>
            <p className="text-2xl font-bold text-white mt-1">{rates.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Tarifa más baja</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{formatPrice(Math.min(...rates.map((r) => r.rate)))}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-neutral-500 text-xs uppercase tracking-wider">Tarifa más alta</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{formatPrice(Math.max(...rates.map((r) => r.rate)))}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wider font-medium">
            <div className="col-span-4">Departamento</div>
            <div className="col-span-3">Tarifa</div>
            <div className="col-span-3">Tiempo estimado</div>
            <div className="col-span-1 text-center">Estado</div>
            <div className="col-span-1 text-center">Acción</div>
          </div>

          <div className="divide-y divide-neutral-800">
            {rates.map((rate) => {
              const isEditing = editingId === rate.department;
              const isSaving = saving === rate.department;

              return (
                <div key={rate.department} className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-neutral-800 transition-colors">
                  <div className="col-span-4">
                    <span className="text-white text-sm font-medium">{rate.department}</span>
                  </div>
                  <div className="col-span-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:border-neutral-600 focus:outline-none"
                      />
                    ) : (
                      <span className="text-white text-sm">{formatPrice(rate.rate)}</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDays}
                        onChange={(e) => setEditDays(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:border-neutral-600 focus:outline-none"
                      />
                    ) : (
                      <span className="text-neutral-400 text-sm">{rate.estimatedDays}</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => toggleActive(rate.department, !rate.isActive)}
                      disabled={isSaving}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        rate.isActive ? "bg-green-500" : "bg-neutral-600"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          rate.isActive ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(rate.department)} disabled={isSaving}
                          className="text-green-400 hover:text-green-300 text-xs font-medium">
                          {isSaving ? "..." : "✓"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-neutral-500 hover:text-white text-xs">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(rate)} className="text-neutral-500 hover:text-primary text-xs transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-white font-medium flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            Configuración de envíos
          </h3>
          <ul className="text-sm text-neutral-500 space-y-1.5 ml-6 list-disc">
            <li>La tarifa se aplica automáticamente cuando el cliente selecciona su departamento en el checkout.</li>
            <li>Departamentos desactivados usarán una tarifa por defecto de $20,000.</li>
            <li>Compras superiores a $200,000 tienen envío gratis (configurable próximamente).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
