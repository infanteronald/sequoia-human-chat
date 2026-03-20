"use client";

import { ShoppingCartIcon, TruckIcon } from "@heroicons/react/24/outline";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 200000;

export default function CartPage() {
  const { state, dispatch, totalPrice } = useCart();
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="mb-6 animate-[bounce_1s_ease-in-out]"><ShoppingCartIcon className="w-16 h-16 mx-auto text-neutral-500" /></div>
        <h1 className="font-heading text-5xl mb-4">CARRITO VACÍO</h1>
        <p className="text-neutral-400 mb-8">No tienes productos en tu carrito</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition"
        >
          SEGUIR COMPRANDO
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-5xl mb-8">CARRITO</h1>

      {/* Free Shipping Bar */}
      <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4 animate-[fade-in_0.5s_ease-out]">
        {remaining > 0 ? (
          <>
            <p className="text-sm text-neutral-300 mb-2">
              <TruckIcon className="w-4 h-4 inline -mt-0.5" /> ¡Te faltan <span className="text-primary font-bold">{formatPrice(remaining)}</span> para envío <span className="text-green-400 font-bold">GRATIS</span>!
            </p>
            <div className="w-full bg-neutral-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-green-400 font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ¡Tienes envío GRATIS!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => {
            const key = `${item.id}-${item.variantId || ""}`;
            return (
              <div key={key} className="flex gap-4 bg-surface rounded-xl p-4 transition-all duration-300 hover:bg-surface-light hover:shadow-lg hover:shadow-black/20">
                <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/products/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/producto/${item.slug}`} className="font-medium hover:text-primary transition">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-sm text-neutral-400 mt-1">{item.variantName}</p>
                  )}
                  <p className="text-primary font-bold mt-2">{formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, variantId: item.variantId } })}
                    className="text-neutral-500 hover:text-red-400 hover:scale-110 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center border border-neutral-600 rounded">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          payload: { id: item.id, variantId: item.variantId, quantity: item.quantity - 1 },
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-800 active:scale-90 transition-transform text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          payload: { id: item.id, variantId: item.variantId, quantity: item.quantity + 1 },
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-800 active:scale-90 transition-transform text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-surface rounded-xl p-6 h-fit sticky top-20">
          <h2 className="font-heading text-2xl mb-4">RESUMEN</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Envío</span>
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-green-400 font-medium">GRATIS</span>
              ) : (
                <span>{formatPrice(15000)}</span>
              )}
            </div>
            <div className="border-t border-neutral-700 pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {formatPrice(totalPrice + (totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 15000))}
              </span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="btn-premium block w-full text-center mt-6 py-3.5 bg-primary text-white font-bold rounded-lg uppercase tracking-wider"
          >
            FINALIZAR COMPRA
          </Link>
          <Link
            href="/"
            className="block w-full text-center mt-3 py-3 border border-neutral-600 hover:border-white text-neutral-300 rounded-lg transition-all duration-300 text-sm hover:scale-[1.02]"
          >
            Seguir comprando
          </Link>

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-neutral-700 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Pago 100% seguro
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6m4 0h2V12l-3-5h-4v10" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
              Envío a toda Colombia
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              Devoluciones en 30 días
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
