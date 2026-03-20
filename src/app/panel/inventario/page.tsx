"use client";

import { useState, useEffect, useCallback } from "react";

interface VariantStock {
  id: string; product: string; productSlug: string;
  variant: string; sku: string | null; stock: number;
}

export default function InventarioPage() {
  const [variants, setVariants] = useState<VariantStock[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filter !== "all") params.set("filter", filter);

    fetch(`/api/panel/inventory?${params}`)
      .then((r) => r.json())
      .then((d) => { setVariants(d.variants || []); setLoading(false); });
  }, [search, filter]);

  useEffect(load, [load]);

  const saveStock = async (id: string) => {
    await fetch("/api/panel/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock: editValue }),
    });
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, stock: editValue } : v));
    setEditingId(null);
  };

  const outCount = variants.filter((v) => v.stock === 0).length;
  const lowCount = variants.filter((v) => v.stock > 0 && v.stock < 5).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Inventario</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {variants.length} variantes total — <span className="text-red-400">{outCount} agotadas</span> — <span className="text-yellow-400">{lowCount} stock bajo</span>
      </p>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar por producto, variante o SKU..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none">
          <option value="all">Todos</option>
          <option value="out">Agotados</option>
          <option value="low">Stock bajo (&lt;5)</option>
        </select>
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Variante</th>
              <th className="text-left p-3">SKU</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-center p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : variants.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No hay variantes</td></tr>
            ) : variants.map((v) => (
              <tr key={v.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="p-3 text-white truncate max-w-[300px]">{v.product}</td>
                <td className="p-3 text-neutral-300">{v.variant}</td>
                <td className="p-3 text-neutral-500 font-mono text-xs">{v.sku || "—"}</td>
                <td className="p-3 text-center">
                  {editingId === v.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <input type="number" value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="w-16 bg-neutral-800 border border-primary rounded px-2 py-1 text-sm text-white text-center"
                        autoFocus onKeyDown={(e) => e.key === "Enter" && saveStock(v.id)} />
                      <button onClick={() => saveStock(v.id)} className="text-green-400 text-xs">✓</button>
                      <button onClick={() => setEditingId(null)} className="text-red-400 text-xs">✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(v.id); setEditValue(v.stock); }}
                      className={`font-medium ${v.stock === 0 ? "text-red-400" : v.stock < 5 ? "text-yellow-400" : "text-white"} hover:underline`}
                    >
                      {v.stock}
                    </button>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    v.stock === 0 ? "bg-red-500/20 text-red-400" :
                    v.stock < 5 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {v.stock === 0 ? "Agotado" : v.stock < 5 ? "Bajo" : "OK"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
