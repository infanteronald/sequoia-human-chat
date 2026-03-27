"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "./CartDrawer";

const mainCategories = [
  { label: "Chaquetas", slug: "chaquetas" },
  { label: "Cascos", slug: "cascos" },
  { label: "Guantes", slug: "guantes-para-moto-impermeables-cuero-o-tela-bogota" },
  { label: "Impermeables", slug: "impermeables" },
  { label: "Pantalones", slug: "pantalones" },
  { label: "Trajes", slug: "trajes-para-moto-antifriccion" },
  { label: "Botas", slug: "botas" },
  { label: "Indumentaria", slug: "dotaciones-mensajeros-motorizados" },
];

export function Navbar() {
  const { totalItems, dispatch, state } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-sequoia.webp" alt="Sequoia Speed" width={120} height={40} className="h-10 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {mainCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="text-sm font-medium text-neutral-300 hover:text-white transition"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/buscar"
              className="text-neutral-300 hover:text-white transition"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="text-neutral-300 hover:text-white transition"
              aria-label="Mi cuenta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            <button
              onClick={() => dispatch({ type: "TOGGLE_CART" })}
              className="relative text-neutral-300 hover:text-white transition"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-neutral-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-neutral-900 border-t border-neutral-800 px-4 py-4 space-y-3">
            {mainCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="block text-neutral-300 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <CartDrawer isOpen={state.isOpen} onClose={() => dispatch({ type: "TOGGLE_CART" })} />
    </>
  );
}
