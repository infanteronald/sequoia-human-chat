"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string;
  categorySlug: string;
  reference: string | null;
  isActive: boolean;
  isFeatured: boolean;
  totalStock: number;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);

    fetch(`/api/panel/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
        setLoading(false);
      });
  }, [page, search, category, status]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/panel/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Productos ({total})</h1>
        <Link
          href="/panel/productos/nuevo"
          className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, referencia..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-right p-3">Precio</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No se encontraron productos</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover bg-neutral-800" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">N/A</div>
                      )}
                      <div>
                        <p className="font-medium text-white truncate max-w-[300px]">{p.name}</p>
                        <p className="text-xs text-neutral-500">{p.reference || p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-neutral-400">{p.category}</td>
                  <td className="p-3 text-right">
                    <p className="text-white">{formatPrice(p.price)}</p>
                    {p.compareAtPrice && (
                      <p className="text-xs text-neutral-500 line-through">{formatPrice(p.compareAtPrice)}</p>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <span className={p.totalStock === 0 ? "text-red-400" : p.totalStock < 5 ? "text-yellow-400" : "text-neutral-300"}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActive(p.id, p.isActive)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {p.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/panel/productos/${p.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm ${
                p === page ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
