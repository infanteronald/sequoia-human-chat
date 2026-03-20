"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import * as gtagLib from "@/lib/datalayer";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        search(query);
      } else if (query.length === 0) {
        loadAll();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const res = await fetch("/api/products?limit=24");
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setLoading(false);
  }

  async function search(q: string) {
    gtagLib.search(q);
    setLoading(true);
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=24`);
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-5xl mb-8">BUSCAR</h1>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-6 py-4 text-lg focus:border-primary focus:outline-none"
          autoFocus
        />
        <p className="text-sm text-neutral-400 mt-2">
          {total} producto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-neutral-800 rounded-xl" />
              <div className="mt-3 h-4 bg-neutral-800 rounded w-3/4" />
              <div className="mt-2 h-4 bg-neutral-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-neutral-400 text-center py-16">No se encontraron productos</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              image={p.image || "/products/placeholder.jpg"}
              category={p.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}
