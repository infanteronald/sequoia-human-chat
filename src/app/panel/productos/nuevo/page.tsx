"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", reference: "", price: 0, categoryId: "",
    isActive: true, shortDescription: "", description: "",
  });

  useEffect(() => {
    fetch("/api/panel/categories").then((r) => r.json()).then((d) => {
      setCategories(d.categories || []);
      if (d.categories?.length > 0) setForm((f) => ({ ...f, categoryId: d.categories[0].id }));
    });
  }, []);

  const save = async () => {
    if (!form.name || !form.categoryId) return;
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const res = await fetch("/api/panel/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    if (res.ok) {
      const { product } = await res.json();
      router.push(`/panel/productos/${product.id}`);
    }
    setSaving(false);
  };

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Nuevo producto</h1>
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 max-w-2xl space-y-4">
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Nombre *</label>
          <input value={form.name} onChange={(e) => { update("name", e.target.value); update("slug", slugify(e.target.value)); }}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Slug</label>
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-400 block mb-1">Precio *</label>
            <input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-1">Categoría *</label>
            <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-400 block mb-1">Referencia</label>
          <input value={form.reference} onChange={(e) => update("reference", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none" />
        </div>
        <button onClick={save} disabled={saving}
          className="bg-primary text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? "Creando..." : "Crear producto"}
        </button>
      </div>
    </div>
  );
}
