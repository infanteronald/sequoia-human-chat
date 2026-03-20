"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─── */
interface Redirect {
  id: number;
  from_path: string;
  to_path: string;
  status_code: number;
  hits: number;
  created_at: string;
}

interface ProductSeo {
  id: string;
  name: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface SitemapData {
  counts: { products: number; categories: number; blog: number; pages: number };
  products: { url: string; updatedAt?: string }[];
  categories: { url: string }[];
  blog: { url: string; updatedAt?: string }[];
  pages: { url: string }[];
}

/* ─── Character count indicator ─── */
function CharCount({ current, max }: { current: number; max: number }) {
  const color = current === 0 ? "text-neutral-600" : current <= max ? "text-emerald-400" : "text-red-400";
  return <span className={`text-xs ${color}`}>{current}/{max}</span>;
}

export default function SeoPage() {
  const [tab, setTab] = useState<"redirects" | "meta" | "sitemap">("redirects");

  /* ─── Redirects state ─── */
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loadingRedirects, setLoadingRedirects] = useState(true);
  const [showAddRedirect, setShowAddRedirect] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Partial<Redirect> | null>(null);
  const [newRedirect, setNewRedirect] = useState({ from_path: "", to_path: "", status_code: 301 });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  /* ─── Meta tags state ─── */
  const [products, setProducts] = useState<ProductSeo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ metaTitle: string; metaDescription: string }>({ metaTitle: "", metaDescription: "" });
  const [productSearch, setProductSearch] = useState("");

  /* ─── Sitemap state ─── */
  const [sitemap, setSitemap] = useState<SitemapData | null>(null);
  const [loadingSitemap, setLoadingSitemap] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  /* ─── Fetch redirects ─── */
  const fetchRedirects = useCallback(async () => {
    setLoadingRedirects(true);
    const res = await fetch("/api/panel/seo?type=redirects");
    const data = await res.json();
    setRedirects(data.redirects || []);
    setLoadingRedirects(false);
  }, []);

  /* ─── Fetch products ─── */
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const res = await fetch("/api/panel/seo?type=products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoadingProducts(false);
  }, []);

  /* ─── Fetch sitemap ─── */
  const fetchSitemap = useCallback(async () => {
    setLoadingSitemap(true);
    const res = await fetch("/api/panel/seo?type=sitemap");
    const data = await res.json();
    setSitemap(data.sitemap || null);
    setLoadingSitemap(false);
  }, []);

  useEffect(() => {
    if (tab === "redirects") fetchRedirects();
    if (tab === "meta") fetchProducts();
    if (tab === "sitemap") fetchSitemap();
  }, [tab, fetchRedirects, fetchProducts, fetchSitemap]);

  /* ─── Redirect actions ─── */
  const addRedirect = async () => {
    if (!newRedirect.from_path || !newRedirect.to_path) return;
    await fetch("/api/panel/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_redirect", ...newRedirect }),
    });
    setNewRedirect({ from_path: "", to_path: "", status_code: 301 });
    setShowAddRedirect(false);
    fetchRedirects();
  };

  const updateRedirect = async () => {
    if (!editingRedirect?.id) return;
    await fetch("/api/panel/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_redirect", ...editingRedirect }),
    });
    setEditingRedirect(null);
    fetchRedirects();
  };

  const deleteRedirect = async (id: number) => {
    await fetch("/api/panel/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_redirect", id }),
    });
    setDeleteConfirm(null);
    fetchRedirects();
  };

  /* ─── Product SEO actions ─── */
  const startEditProduct = (p: ProductSeo) => {
    setEditingProduct(p.id);
    setEditValues({ metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "" });
  };

  const saveProductSeo = async (id: string) => {
    await fetch("/api/panel/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_product_seo", id, ...editValues }),
    });
    setEditingProduct(null);
    fetchProducts();
  };

  /* ─── Sitemap generation ─── */
  const generateSitemap = async () => {
    setGenerating(true);
    const res = await fetch("/api/panel/seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_sitemap" }),
    });
    const data = await res.json();
    if (data.generatedAt) setLastGenerated(data.generatedAt);
    setGenerating(false);
    fetchSitemap();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.slug.toLowerCase().includes(productSearch.toLowerCase())
  );

  const tabs = [
    { key: "redirects" as const, label: "Redirecciones" },
    { key: "meta" as const, label: "Meta Tags" },
    { key: "sitemap" as const, label: "Sitemap" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">SEO</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-900 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition ${
              tab === t.key ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ REDIRECTS TAB ═══════════════════ */}
      {tab === "redirects" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-neutral-400">{redirects.length} redirecciones configuradas</p>
            <button
              onClick={() => setShowAddRedirect(!showAddRedirect)}
              className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition"
            >
              + Agregar redirección
            </button>
          </div>

          {/* Add form */}
          {showAddRedirect && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Desde</label>
                  <input
                    type="text"
                    value={newRedirect.from_path}
                    onChange={(e) => setNewRedirect({ ...newRedirect, from_path: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600 transition"
                    placeholder="/ruta-antigua"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Hacia</label>
                  <input
                    type="text"
                    value={newRedirect.to_path}
                    onChange={(e) => setNewRedirect({ ...newRedirect, to_path: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600 transition"
                    placeholder="/ruta-nueva"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Código</label>
                  <select
                    value={newRedirect.status_code}
                    onChange={(e) => setNewRedirect({ ...newRedirect, status_code: parseInt(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600 transition"
                  >
                    <option value={301}>301 - Permanente</option>
                    <option value={302}>302 - Temporal</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddRedirect(false)} className="px-3 py-1.5 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition">
                  Cancelar
                </button>
                <button onClick={addRedirect} className="px-4 py-1.5 text-sm bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition font-medium">
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Redirects table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {loadingRedirects ? (
              <div className="p-8 text-center text-neutral-500">Cargando...</div>
            ) : redirects.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">No hay redirecciones</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Desde</th>
                    <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Hacia</th>
                    <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Código</th>
                    <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Visitas</th>
                    <th className="text-right text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition">
                      {editingRedirect?.id === r.id ? (
                        <>
                          <td className="px-4 py-2">
                            <input type="text" value={editingRedirect.from_path || ""} onChange={(e) => setEditingRedirect({ ...editingRedirect, from_path: e.target.value })}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="text" value={editingRedirect.to_path || ""} onChange={(e) => setEditingRedirect({ ...editingRedirect, to_path: e.target.value })}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600" />
                          </td>
                          <td className="px-4 py-2">
                            <select value={editingRedirect.status_code || 301} onChange={(e) => setEditingRedirect({ ...editingRedirect, status_code: parseInt(e.target.value) })}
                              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600">
                              <option value={301}>301</option>
                              <option value={302}>302</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-neutral-400 text-sm">{r.hits}</td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => setEditingRedirect(null)} className="text-neutral-500 hover:text-white text-sm mr-2">Cancelar</button>
                            <button onClick={updateRedirect} className="text-emerald-400 hover:text-emerald-300 text-sm">Guardar</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-neutral-300 text-sm font-mono">{r.from_path}</td>
                          <td className="px-4 py-3 text-neutral-300 text-sm font-mono">{r.to_path}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              r.status_code === 301 ? "bg-blue-400/10 text-blue-400" : "bg-amber-400/10 text-amber-400"
                            }`}>
                              {r.status_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-400 text-sm">{r.hits}</td>
                          <td className="px-4 py-3 text-right space-x-3">
                            <button onClick={() => setEditingRedirect(r)} className="text-neutral-500 hover:text-white text-sm transition">Editar</button>
                            {deleteConfirm === r.id ? (
                              <>
                                <button onClick={() => deleteRedirect(r.id)} className="text-red-400 hover:text-red-300 text-sm transition">Confirmar</button>
                                <button onClick={() => setDeleteConfirm(null)} className="text-neutral-500 text-sm transition">No</button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteConfirm(r.id)} className="text-neutral-500 hover:text-red-400 text-sm transition">Eliminar</button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ META TAGS TAB ═══════════════════ */}
      {tab === "meta" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              placeholder="Buscar producto..."
            />
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {loadingProducts ? (
              <div className="p-8 text-center text-neutral-500">Cargando...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">No hay productos</div>
            ) : (
              <div className="divide-y divide-neutral-800/50">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="px-4 py-3 hover:bg-neutral-800/30 transition">
                    {editingProduct === p.id ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-white font-medium text-sm">{p.name}</span>
                            <span className="block text-xs text-neutral-500 font-mono mt-0.5">/producto/{p.slug}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingProduct(null)} className="px-3 py-1 text-xs bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition">
                              Cancelar
                            </button>
                            <button onClick={() => saveProductSeo(p.id)} className="px-3 py-1 text-xs bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition font-medium">
                              Guardar
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-neutral-500 uppercase tracking-wider">Title Tag</label>
                            <CharCount current={editValues.metaTitle.length} max={60} />
                          </div>
                          <input
                            type="text"
                            value={editValues.metaTitle}
                            onChange={(e) => setEditValues({ ...editValues, metaTitle: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600 transition"
                            placeholder={p.name}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-neutral-500 uppercase tracking-wider">Meta Description</label>
                            <CharCount current={editValues.metaDescription.length} max={160} />
                          </div>
                          <textarea
                            value={editValues.metaDescription}
                            onChange={(e) => setEditValues({ ...editValues, metaDescription: e.target.value })}
                            rows={2}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm focus:outline-none focus:border-neutral-600 transition resize-y"
                            placeholder="Descripción para motores de búsqueda..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => startEditProduct(p)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium truncate">{p.name}</span>
                            {p.metaTitle && p.metaDescription ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-400/10 text-emerald-400">SEO</span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-400">Incompleto</span>
                            )}
                          </div>
                          <span className="block text-xs text-neutral-500 mt-0.5 truncate">
                            {p.metaTitle || "Sin title tag"} · {p.metaDescription ? `${p.metaDescription.substring(0, 60)}...` : "Sin meta description"}
                          </span>
                        </div>
                        <span className="text-neutral-600 text-sm ml-4">Editar</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ SITEMAP TAB ═══════════════════ */}
      {tab === "sitemap" && (
        <div>
          {/* Status card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">Sitemap XML</h3>
                <p className="text-neutral-400 text-sm mt-1">
                  {lastGenerated
                    ? `Última generación: ${new Date(lastGenerated).toLocaleString("es-CO")}`
                    : "Genera el sitemap para actualizar las URLs"}
                </p>
                <a href="/sitemap.xml" target="_blank" className="text-emerald-400 text-sm hover:underline mt-1 inline-block">
                  /sitemap.xml
                </a>
              </div>
              <button
                onClick={generateSitemap}
                disabled={generating}
                className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {generating ? "Generando..." : "Regenerar sitemap"}
              </button>
            </div>
          </div>

          {loadingSitemap ? (
            <div className="p-8 text-center text-neutral-500">Cargando...</div>
          ) : sitemap ? (
            <div className="space-y-4">
              {/* Counts summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Productos", count: sitemap.counts.products },
                  { label: "Categorías", count: sitemap.counts.categories },
                  { label: "Blog", count: sitemap.counts.blog },
                  { label: "Páginas", count: sitemap.counts.pages },
                ].map((item) => (
                  <div key={item.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">{item.label}</span>
                    <span className="block text-2xl text-white font-bold mt-1">{item.count}</span>
                  </div>
                ))}
              </div>

              {/* URL groups */}
              {[
                { title: "Productos", items: sitemap.products },
                { title: "Categorías", items: sitemap.categories },
                { title: "Páginas", items: sitemap.pages },
                { title: "Blog", items: sitemap.blog },
              ].map((group) => (
                <div key={group.title} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">{group.title}</span>
                    <span className="text-xs text-neutral-600 ml-2">({group.items.length})</span>
                  </div>
                  <div className="divide-y divide-neutral-800/50 max-h-48 overflow-y-auto">
                    {group.items.map((item: any, i: number) => (
                      <div key={i} className="px-4 py-2 flex justify-between items-center">
                        <span className="text-neutral-300 text-sm font-mono truncate">{String(item.url)}</span>
                        {(item as any).updatedAt && (
                          <span className="text-neutral-600 text-xs ml-2 shrink-0">
                            {new Date(String((item as any).updatedAt)).toLocaleDateString("es-CO")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500">No hay datos del sitemap</div>
          )}
        </div>
      )}
    </div>
  );
}
