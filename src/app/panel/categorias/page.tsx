"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string; name: string; slug: string; description: string | null;
  icon: string | null; order: number; isActive: boolean; productCount: number;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/panel/categories").then((r) => r.json()).then((d) => {
      setCategories(d.categories || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await fetch(`/api/panel/categories/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
    } else {
      await fetch("/api/panel/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
    }
    setEditing(null);
    setSaving(false);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        <button
          onClick={() => setEditing({ id: "", name: "", slug: "", description: null, icon: null, order: 0, isActive: true, productCount: 0 })}
          className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + Nueva categoría
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-white">{editing.id ? "Editar" : "Nueva"} categoría</h2>
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Nombre</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Slug</label>
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-neutral-400 block mb-1">Descripción</label>
              <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value || null })}
                rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-400 block mb-1">Icono</label>
                <input value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value || null })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-1">Orden</label>
                <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              <span className="text-neutral-300">Activa</span>
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="text-sm text-neutral-400 hover:text-white">Cancelar</button>
              <button onClick={save} disabled={saving}
                className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Categoría</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-center p-3">Productos</th>
              <th className="text-center p-3">Orden</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="p-3">
                  <span className="text-white font-medium">{c.icon && `${c.icon} `}{c.name}</span>
                </td>
                <td className="p-3 text-neutral-500 font-mono text-xs">{c.slug}</td>
                <td className="p-3 text-center text-neutral-400">{c.productCount}</td>
                <td className="p-3 text-center text-neutral-400">{c.order}</td>
                <td className="p-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {c.isActive ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="text-primary hover:underline text-sm">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
