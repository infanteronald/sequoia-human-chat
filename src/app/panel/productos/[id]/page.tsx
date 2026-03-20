"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Variant {
  id?: string;
  name: string;
  sku: string | null;
  stock: number;
  priceModifier: number;
  isActive: boolean;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
  isCover: boolean;
}

interface Benefit { icon: string; text: string; }
interface Review { name: string; city: string; rating: number; text: string; }
interface FAQ { q: string; a: string; }

const tabs = ["General", "Contenido", "CRO / Marketing", "Variantes", "Imágenes"];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", slug: "", reference: "", price: 0, compareAtPrice: null as number | null,
    costPrice: null as number | null, categoryId: "", isActive: true, isFeatured: false,
    weight: null as number | null, shortDescription: "", description: "",
    metaTitle: "", metaDescription: "", subtitle: "",
  });
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/panel/products/${id}`).then((r) => r.json()),
      fetch("/api/panel/categories").then((r) => r.json()),
    ]).then(([product, cats]) => {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        reference: product.reference || "",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        categoryId: product.category?.id || "",
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        weight: product.weight,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        subtitle: product.subtitle || "",
      });
      setBenefits(product.benefits || []);
      setReviews(product.reviews || []);
      setFaq(product.faq || []);
      setVariants(product.variants || []);
      setImages(product.images || []);
      setCategories(cats.categories || []);
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/panel/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          benefits: benefits.length > 0 ? benefits : null,
          reviews: reviews.length > 0 ? reviews : null,
          faq: faq.length > 0 ? faq : null,
          variants,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setMessage({ type: "success", text: "Producto guardado correctamente" });
    } catch {
      setMessage({ type: "error", text: "Error al guardar el producto" });
    }
    setSaving(false);
  };

  if (loading) return <div className="text-neutral-500 p-8">Cargando producto...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/panel/productos" className="text-sm text-neutral-500 hover:text-white">&larr; Volver a productos</Link>
          <h1 className="text-2xl font-bold text-white mt-1">{form.name || "Editar producto"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="bg-primary text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-neutral-800">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === i
                ? "border-primary text-primary"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        {tab === 0 && <GeneralTab form={form} setForm={setForm} categories={categories} />}
        {tab === 1 && <ContentTab form={form} setForm={setForm} />}
        {tab === 2 && <CROTab benefits={benefits} setBenefits={setBenefits} reviews={reviews} setReviews={setReviews} faq={faq} setFaq={setFaq} />}
        {tab === 3 && <VariantsTab variants={variants} setVariants={setVariants} />}
        {tab === 4 && <ImagesTab images={images} setImages={setImages} productId={id} />}
      </div>
    </div>
  );
}

/* ── Tab Components ────────────────────────────────── */

function GeneralTab({ form, setForm, categories }: { form: any; setForm: any; categories: { id: string; name: string }[] }) {
  const update = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-4 max-w-2xl">
      <Field label="Nombre" value={form.name as string} onChange={(v) => update("name", v)} />
      <Field label="Slug" value={form.slug as string} onChange={(v) => update("slug", v)} />
      <Field label="Referencia" value={form.reference as string} onChange={(v) => update("reference", v)} />
      <div className="grid grid-cols-3 gap-4">
        <Field label="Precio" type="number" value={String(form.price)} onChange={(v) => update("price", Number(v))} />
        <Field label="Precio comparación" type="number" value={String(form.compareAtPrice || "")} onChange={(v) => update("compareAtPrice", v ? Number(v) : null)} />
        <Field label="Costo" type="number" value={String(form.costPrice || "")} onChange={(v) => update("costPrice", v ? Number(v) : null)} />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-1">Categoría</label>
        <select
          value={form.categoryId as string}
          onChange={(e) => update("categoryId", e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
        >
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <Field label="Peso (kg)" type="number" value={String(form.weight || "")} onChange={(v) => update("weight", v ? Number(v) : null)} />
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive as boolean} onChange={(e) => update("isActive", e.target.checked)} className="rounded" />
          <span className="text-neutral-300">Activo</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured as boolean} onChange={(e) => update("isFeatured", e.target.checked)} className="rounded" />
          <span className="text-neutral-300">Destacado</span>
        </label>
      </div>
    </div>
  );
}

function ContentTab({ form, setForm }: { form: any; setForm: any }) {
  const update = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-4 max-w-3xl">
      <Field label="Subtítulo (CRO)" value={form.subtitle as string} onChange={(v) => update("subtitle", v)} placeholder="Ej: Protección premium para motociclistas profesionales" />
      <div>
        <label className="text-sm text-neutral-400 block mb-1">Descripción corta (HTML)</label>
        <textarea
          value={form.shortDescription as string}
          onChange={(e) => update("shortDescription", e.target.value)}
          rows={4}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none font-mono"
        />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-1">Descripción completa (HTML)</label>
        <textarea
          value={form.description as string}
          onChange={(e) => update("description", e.target.value)}
          rows={8}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none font-mono"
        />
      </div>
      <Field label="Meta título (SEO)" value={form.metaTitle as string} onChange={(v) => update("metaTitle", v)} />
      <Field label="Meta descripción (SEO)" value={form.metaDescription as string} onChange={(v) => update("metaDescription", v)} />
    </div>
  );
}

function CROTab({
  benefits, setBenefits, reviews, setReviews, faq, setFaq,
}: {
  benefits: Benefit[]; setBenefits: (b: Benefit[]) => void;
  reviews: Review[]; setReviews: (r: Review[]) => void;
  faq: FAQ[]; setFaq: (f: FAQ[]) => void;
}) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Benefits */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Beneficios</h3>
          <button
            onClick={() => setBenefits([...benefits, { icon: "✅", text: "" }])}
            className="text-sm text-primary hover:underline"
          >
            + Agregar
          </button>
        </div>
        <div className="space-y-2">
          {benefits.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={b.icon}
                onChange={(e) => { const n = [...benefits]; n[i] = { ...b, icon: e.target.value }; setBenefits(n); }}
                className="w-12 bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-sm text-center"
              />
              <input
                value={b.text}
                onChange={(e) => { const n = [...benefits]; n[i] = { ...b, text: e.target.value }; setBenefits(n); }}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white"
                placeholder="Texto del beneficio"
              />
              <button onClick={() => setBenefits(benefits.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Reseñas</h3>
          <button
            onClick={() => setReviews([...reviews, { name: "", city: "", rating: 5, text: "" }])}
            className="text-sm text-primary hover:underline"
          >
            + Agregar
          </button>
        </div>
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={r.name} onChange={(e) => { const n = [...reviews]; n[i] = { ...r, name: e.target.value }; setReviews(n); }}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white" placeholder="Nombre" />
                <input value={r.city} onChange={(e) => { const n = [...reviews]; n[i] = { ...r, city: e.target.value }; setReviews(n); }}
                  className="w-32 bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white" placeholder="Ciudad" />
                <select value={r.rating} onChange={(e) => { const n = [...reviews]; n[i] = { ...r, rating: Number(e.target.value) }; setReviews(n); }}
                  className="w-16 bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white">
                  {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v}★</option>)}
                </select>
                <button onClick={() => setReviews(reviews.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
              </div>
              <textarea value={r.text} onChange={(e) => { const n = [...reviews]; n[i] = { ...r, text: e.target.value }; setReviews(n); }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white" rows={2} placeholder="Texto de la reseña" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Preguntas frecuentes</h3>
          <button
            onClick={() => setFaq([...faq, { q: "", a: "" }])}
            className="text-sm text-primary hover:underline"
          >
            + Agregar
          </button>
        </div>
        <div className="space-y-3">
          {faq.map((f, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input value={f.q} onChange={(e) => { const n = [...faq]; n[i] = { ...f, q: e.target.value }; setFaq(n); }}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white" placeholder="Pregunta" />
                <button onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-sm px-2">✕</button>
              </div>
              <textarea value={f.a} onChange={(e) => { const n = [...faq]; n[i] = { ...f, a: e.target.value }; setFaq(n); }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 text-sm text-white" rows={2} placeholder="Respuesta" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VariantsTab({ variants, setVariants }: { variants: Variant[]; setVariants: (v: Variant[]) => void }) {
  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">Variantes</h3>
        <button
          onClick={() => setVariants([...variants, { name: "", sku: null, stock: 0, priceModifier: 0, isActive: true }])}
          className="text-sm text-primary hover:underline"
        >
          + Agregar variante
        </button>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_120px_80px_100px_40px] gap-2 text-xs text-neutral-500 px-1">
          <span>Nombre</span><span>SKU</span><span>Stock</span><span>+/- Precio</span><span></span>
        </div>
        {variants.map((v, i) => (
          <div key={v.id || i} className="grid grid-cols-[1fr_120px_80px_100px_40px] gap-2 items-center">
            <input value={v.name} onChange={(e) => { const n = [...variants]; n[i] = { ...v, name: e.target.value }; setVariants(n); }}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" placeholder="Ej: Talla S" />
            <input value={v.sku || ""} onChange={(e) => { const n = [...variants]; n[i] = { ...v, sku: e.target.value || null }; setVariants(n); }}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" placeholder="SKU" />
            <input type="number" value={v.stock} onChange={(e) => { const n = [...variants]; n[i] = { ...v, stock: Number(e.target.value) }; setVariants(n); }}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" />
            <input type="number" value={v.priceModifier} onChange={(e) => { const n = [...variants]; n[i] = { ...v, priceModifier: Number(e.target.value) }; setVariants(n); }}
              className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" />
            <button onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-sm">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImagesTab({ images, setImages, productId }: { images: ProductImage[]; setImages: (i: ProductImage[]) => void; productId: string }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/panel/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    const imgRes = await fetch(`/api/panel/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, isCover: images.length === 0 }),
    });
    const { image } = await imgRes.json();
    setImages([...images, image]);
    setUploading(false);
  };

  const setCover = async (imageId: string) => {
    const updated = images.map((img) => ({ ...img, isCover: img.id === imageId }));
    setImages(updated);
    await fetch(`/api/panel/products/${productId}/images`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: updated }),
    });
  };

  const deleteImage = async (imageId: string) => {
    await fetch(`/api/panel/products/${productId}/images?imageId=${imageId}`, { method: "DELETE" });
    setImages(images.filter((img) => img.id !== imageId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Imágenes ({images.length})</h3>
        <label className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 cursor-pointer">
          {uploading ? "Subiendo..." : "+ Subir imagen"}
          <input type="file" accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className={`relative rounded-lg overflow-hidden border-2 ${img.isCover ? "border-primary" : "border-neutral-700"}`}>
            <img src={img.url} alt={img.alt || ""} className="w-full aspect-square object-cover bg-neutral-800" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 flex justify-between items-center">
              <button
                onClick={() => setCover(img.id)}
                className={`text-xs ${img.isCover ? "text-primary" : "text-neutral-400 hover:text-white"}`}
              >
                {img.isCover ? "★ Cover" : "Hacer cover"}
              </button>
              <button onClick={() => deleteImage(img.id)} className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared Components ─────────────────────────────── */

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-neutral-400 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
      />
    </div>
  );
}
