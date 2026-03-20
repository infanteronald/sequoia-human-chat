"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  isActive: boolean;
  reference: string | null;
  image: string | null;
  stock: number;
}

interface EditedProduct {
  name?: string;
  price?: number;
  compareAtPrice?: number | null;
  isActive?: boolean;
  stock?: number;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default function BulkEditorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  // Edits tracking
  const [edits, setEdits] = useState<Record<string, EditedProduct>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Bulk action modal
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkValue, setBulkValue] = useState("");

  const loadProducts = useCallback(async (p = 1, q = "") => {
    setLoading(true);
    const res = await fetch(`/api/panel/products/bulk?page=${p}&limit=50&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(page, search); }, [loadProducts, page, search]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleSearch = (val: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 300);
  };

  const getEditedValue = (id: string, field: keyof EditedProduct, original: unknown) => {
    return edits[id]?.[field] !== undefined ? edits[id][field] : original;
  };

  const isEdited = (id: string, field: keyof EditedProduct) => edits[id]?.[field] !== undefined;

  const setEdit = (id: string, field: keyof EditedProduct, value: unknown) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map(p => p.id)));
    }
  };

  const handleSave = async () => {
    const changes = Object.entries(edits).map(([id, edit]) => ({ id, ...edit }));
    if (changes.length === 0) return;
    setSaving(true);
    await fetch("/api/panel/products/bulk", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes }),
    });
    setSaving(false);
    setEdits({});
    loadProducts(page, search);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    const ids = Array.from(selected);

    if (bulkAction === "delete") {
      if (!confirm(`¿Eliminar ${ids.length} productos? Esta acción no se puede deshacer.`)) return;
      await fetch("/api/panel/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } else if (bulkAction === "activate" || bulkAction === "deactivate") {
      await fetch("/api/panel/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkAction, ids }),
      });
    } else if (bulkAction === "set_price" || bulkAction === "percent_price" || bulkAction === "set_stock") {
      await fetch("/api/panel/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkAction, ids, value: bulkValue }),
      });
    }

    setBulkAction(null);
    setBulkValue("");
    setSelected(new Set());
    setEdits({});
    loadProducts(page, search);
  };

  const handleCellClick = (id: string, field: string) => {
    setEditingCell({ id, field });
  };

  const handleCellBlur = (id: string, field: keyof EditedProduct, value: string, original: unknown) => {
    setEditingCell(null);
    let parsed: unknown;
    if (field === "price" || field === "compareAtPrice" || field === "stock") {
      parsed = field === "stock" ? parseInt(value) : parseFloat(value);
      if (isNaN(parsed as number)) return;
    } else {
      parsed = value;
    }
    if (parsed !== original) {
      setEdit(id, field, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: keyof EditedProduct, value: string, original: unknown) => {
    if (e.key === "Enter") {
      handleCellBlur(id, field, value, original);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const editCount = Object.keys(edits).length;
  const hasSelection = selected.size > 0;

  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/panel/productos" className="text-neutral-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white">Edición masiva</h1>
              <p className="text-sm text-neutral-500 mt-0.5">{total} productos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {editCount > 0 && (
              <span className="text-sm text-neutral-400">{editCount} producto{editCount !== 1 ? "s" : ""} modificado{editCount !== 1 ? "s" : ""}</span>
            )}
            <button onClick={handleSave} disabled={editCount === 0 || saving} className="bg-white text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-100 disabled:opacity-30 transition-colors">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input onChange={e => handleSearch(e.target.value)} placeholder="Buscar productos..." className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors" />
        </div>

        {/* Bulk Actions Bar */}
        {hasSelection && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-neutral-400">{selected.size} seleccionado{selected.size !== 1 ? "s" : ""}</span>
            <div className="w-px h-5 bg-neutral-800" />
            <button onClick={() => setBulkAction("set_price")} className="text-sm text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">Cambiar precio</button>
            <button onClick={() => setBulkAction("percent_price")} className="text-sm text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">% precio</button>
            <button onClick={() => setBulkAction("set_stock")} className="text-sm text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">Cambiar stock</button>
            <button onClick={() => { setBulkAction("activate"); }} className="text-sm text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">Activar</button>
            <button onClick={() => { setBulkAction("deactivate"); }} className="text-sm text-neutral-300 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">Desactivar</button>
            <button onClick={() => setBulkAction("delete")} className="text-sm text-red-400 hover:text-red-300 bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors">Eliminar</button>
          </div>
        )}

        {/* Bulk Action Modal */}
        {bulkAction && bulkAction !== "activate" && bulkAction !== "deactivate" && bulkAction !== "delete" && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-neutral-400">
                {bulkAction === "set_price" ? "Nuevo precio:" : bulkAction === "percent_price" ? "Porcentaje (ej: 10 para +10%, -15 para -15%):" : "Nuevo stock:"}
              </label>
              <input value={bulkValue} onChange={e => setBulkValue(e.target.value)} type="number" className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white w-40 focus:outline-none focus:border-neutral-600 transition-colors" placeholder={bulkAction === "percent_price" ? "10" : "0"} />
              <button onClick={handleBulkAction} disabled={!bulkValue} className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 disabled:opacity-30 transition-colors">Aplicar</button>
              <button onClick={() => { setBulkAction(null); setBulkValue(""); }} className="text-sm text-neutral-500 hover:text-white transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {/* Confirm modal for activate/deactivate/delete */}
        {(bulkAction === "activate" || bulkAction === "deactivate" || bulkAction === "delete") && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">
                {bulkAction === "delete" ? `¿Eliminar ${selected.size} productos?` : bulkAction === "activate" ? `¿Activar ${selected.size} productos?` : `¿Desactivar ${selected.size} productos?`}
              </span>
              <button onClick={handleBulkAction} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bulkAction === "delete" ? "bg-neutral-800 text-red-400 hover:bg-neutral-700" : "bg-white text-neutral-900 hover:bg-neutral-100"}`}>Confirmar</button>
              <button onClick={() => setBulkAction(null)} className="text-sm text-neutral-500 hover:text-white transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-neutral-500">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center text-neutral-500">No se encontraron productos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleAll} className="rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0" />
                    </th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-14">Img</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Nombre</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-32">Precio</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-32">Precio oferta</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-24">Stock</th>
                    <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3 w-24">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const currentName = getEditedValue(p.id, "name", p.name) as string;
                    const currentPrice = getEditedValue(p.id, "price", p.price) as number;
                    const currentCompare = getEditedValue(p.id, "compareAtPrice", p.compareAtPrice) as number | null;
                    const currentStock = getEditedValue(p.id, "stock", p.stock) as number;
                    const currentActive = getEditedValue(p.id, "isActive", p.isActive) as boolean;

                    return (
                      <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0" />
                        </td>
                        <td className="px-4 py-2.5">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#525252" strokeWidth="1.5"/><circle cx="6" cy="6" r="1.5" stroke="#525252" strokeWidth="1"/><path d="M2 11L5.5 7.5L8 10L10.5 7L14 11" stroke="#525252" strokeWidth="1"/></svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {editingCell?.id === p.id && editingCell.field === "name" ? (
                            <input ref={inputRef} defaultValue={currentName} onBlur={e => handleCellBlur(p.id, "name", e.target.value, p.name)} onKeyDown={e => handleKeyDown(e, p.id, "name", (e.target as HTMLInputElement).value, p.name)} className="w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                          ) : (
                            <button onClick={() => handleCellClick(p.id, "name")} className={`text-sm text-left w-full truncate max-w-xs ${isEdited(p.id, "name") ? "text-neutral-400" : "text-white"}`}>
                              {currentName}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {editingCell?.id === p.id && editingCell.field === "price" ? (
                            <input ref={inputRef} type="number" defaultValue={currentPrice} onBlur={e => handleCellBlur(p.id, "price", e.target.value, p.price)} onKeyDown={e => handleKeyDown(e, p.id, "price", (e.target as HTMLInputElement).value, p.price)} className="w-28 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white text-right focus:outline-none" />
                          ) : (
                            <button onClick={() => handleCellClick(p.id, "price")} className={`text-sm ${isEdited(p.id, "price") ? "text-neutral-400" : "text-neutral-300"}`}>
                              {formatPrice(currentPrice)}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {editingCell?.id === p.id && editingCell.field === "compareAtPrice" ? (
                            <input ref={inputRef} type="number" defaultValue={currentCompare || ""} onBlur={e => handleCellBlur(p.id, "compareAtPrice", e.target.value || "0", p.compareAtPrice)} onKeyDown={e => handleKeyDown(e, p.id, "compareAtPrice", (e.target as HTMLInputElement).value || "0", p.compareAtPrice)} className="w-28 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white text-right focus:outline-none" />
                          ) : (
                            <button onClick={() => handleCellClick(p.id, "compareAtPrice")} className={`text-sm ${isEdited(p.id, "compareAtPrice") ? "text-neutral-400" : "text-neutral-500"}`}>
                              {currentCompare ? formatPrice(currentCompare) : "—"}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {editingCell?.id === p.id && editingCell.field === "stock" ? (
                            <input ref={inputRef} type="number" defaultValue={currentStock} onBlur={e => handleCellBlur(p.id, "stock", e.target.value, p.stock)} onKeyDown={e => handleKeyDown(e, p.id, "stock", (e.target as HTMLInputElement).value, p.stock)} className="w-20 bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white text-right focus:outline-none" />
                          ) : (
                            <button onClick={() => handleCellClick(p.id, "stock")} className={`text-sm ${isEdited(p.id, "stock") ? "text-neutral-400" : currentStock <= 0 ? "text-red-400" : "text-neutral-300"}`}>
                              {currentStock}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button onClick={() => setEdit(p.id, "isActive", !currentActive)} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${currentActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"} ${isEdited(p.id, "isActive") ? "ring-1 ring-blue-400/50" : ""}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${currentActive ? "bg-emerald-400" : "bg-neutral-600"}`} />
                            {currentActive ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors">Anterior</button>
            <span className="text-sm text-neutral-500">Página {page} de {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg disabled:opacity-30 hover:bg-neutral-700 transition-colors">Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}
