"use client";

import { useState, useEffect, useCallback } from "react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author: string;
  status: string;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPost: Partial<BlogPost> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  author: "Sequoia Speed",
  status: "draft",
  tags: [],
  seo_title: "",
  seo_description: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ContenidoPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/panel/blog${params}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openNew = () => {
    setEditing({ ...emptyPost });
    setIsNew(true);
    setSlugManual(false);
    setSeoOpen(false);
    setError("");
  };

  const openEdit = async (id: number) => {
    const res = await fetch(`/api/panel/blog?id=${id}`);
    const data = await res.json();
    if (data.post) {
      setEditing(data.post);
      setIsNew(false);
      setSlugManual(true);
      setSeoOpen(false);
      setError("");
    }
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
    setError("");
  };

  const save = async () => {
    if (!editing?.title || !editing?.slug) {
      setError("Título y slug son requeridos");
      return;
    }
    setSaving(true);
    setError("");

    const method = isNew ? "POST" : "PUT";
    const body = {
      ...editing,
      tags: typeof editing.tags === "string"
        ? (editing.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean)
        : editing.tags || [],
    };

    const res = await fetch("/api/panel/blog", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al guardar");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(null);
    setIsNew(false);
    fetchPosts();
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/panel/blog?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    if (editing?.id === id) cancel();
    fetchPosts();
  };

  const updateField = (field: string, value: any) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === "title" && !slugManual) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  };

  const tabs = [
    { key: "all", label: "Todos" },
    { key: "published", label: "Publicados" },
    { key: "draft", label: "Borradores" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Contenido</h1>
        <button onClick={openNew} className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
          + Nuevo artículo
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-900 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition ${
              filter === t.key ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Cargando...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No hay artículos</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Título</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Estado</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Autor</th>
                <th className="text-left text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Fecha</th>
                <th className="text-right text-xs text-neutral-500 uppercase tracking-wider px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition cursor-pointer"
                  onClick={() => openEdit(post.id)}
                >
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{post.title}</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">/{post.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      post.status === "published"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-neutral-700 text-neutral-400"
                    }`}>
                      {post.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-sm">{post.author}</td>
                  <td className="px-4 py-3 text-neutral-400 text-sm">{formatDate(post.published_at || post.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(post.id); }}
                      className="text-neutral-500 hover:text-red-400 text-sm transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="mt-4 bg-neutral-900 border border-red-900/50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-neutral-300">¿Eliminar este artículo? Esta acción no se puede deshacer.</span>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition">
              Cancelar
            </button>
            <button onClick={() => deletePost(deleteConfirm)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition">
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Inline editor */}
      {editing && (
        <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">{isNew ? "Nuevo artículo" : "Editar artículo"}</h2>
            <div className="flex gap-2">
              <button onClick={cancel} className="px-4 py-2 text-sm bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50 font-medium">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Título</label>
            <input
              type="text"
              value={editing.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white text-lg placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              placeholder="Título del artículo"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600 text-sm">/blog/</span>
              <input
                type="text"
                value={editing.slug || ""}
                onChange={(e) => { setSlugManual(true); updateField("slug", e.target.value); }}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition font-mono"
                placeholder="titulo-del-articulo"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Contenido (Markdown)</label>
            <textarea
              value={editing.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
              rows={14}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition font-mono leading-relaxed resize-y"
              placeholder="Escribe el contenido en Markdown..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Extracto</label>
            <textarea
              value={editing.excerpt || ""}
              onChange={(e) => updateField("excerpt", e.target.value)}
              rows={3}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition resize-y"
              placeholder="Breve descripción del artículo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cover image */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Imagen de portada (URL)</label>
              <input
                type="text"
                value={editing.cover_image || ""}
                onChange={(e) => updateField("cover_image", e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
                placeholder="https://..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Tags (separados por coma)</label>
              <input
                type="text"
                value={Array.isArray(editing.tags) ? editing.tags.join(", ") : editing.tags || ""}
                onChange={(e) => updateField("tags", e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
                placeholder="motos, cascos, velocidad"
              />
            </div>
          </div>

          {/* Author + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Autor</label>
              <input
                type="text"
                value={editing.author || ""}
                onChange={(e) => updateField("author", e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Estado</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => updateField("status", "draft")}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    editing.status === "draft" ? "bg-neutral-700 text-white" : "bg-neutral-800/50 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Borrador
                </button>
                <button
                  onClick={() => updateField("status", "published")}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    editing.status === "published" ? "bg-emerald-400/15 text-emerald-400" : "bg-neutral-800/50 text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Publicado
                </button>
              </div>
            </div>
          </div>

          {/* SEO section (collapsible) */}
          <div className="border-t border-neutral-800 pt-4">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${seoOpen ? "rotate-90" : ""}`}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
              SEO
            </button>
            {seoOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">SEO Title</label>
                  <input
                    type="text"
                    value={editing.seo_title || ""}
                    onChange={(e) => updateField("seo_title", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition"
                    placeholder="Título para motores de búsqueda"
                  />
                  <span className={`text-xs mt-1 block ${(editing.seo_title?.length || 0) > 60 ? "text-red-400" : "text-neutral-600"}`}>
                    {editing.seo_title?.length || 0}/60
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">SEO Description</label>
                  <textarea
                    value={editing.seo_description || ""}
                    onChange={(e) => updateField("seo_description", e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition resize-y"
                    placeholder="Descripción para motores de búsqueda"
                  />
                  <span className={`text-xs mt-1 block ${(editing.seo_description?.length || 0) > 160 ? "text-red-400" : "text-neutral-600"}`}>
                    {editing.seo_description?.length || 0}/160
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
