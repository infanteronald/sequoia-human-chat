"use client";

import { TruckIcon, ShoppingCartIcon, LockClosedIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import * as gtag from "@/lib/datalayer";

const FREE_SHIPPING_THRESHOLD = 200000;

export function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state, dispatch, totalPrice } = useCart();
  const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (!isOpen) return null;

  // GA4: view_cart
  gtag.viewCart(
    state.items.map(i => ({ item_id: i.id, item_name: i.name, item_variant: i.variantName, price: i.price, quantity: i.quantity })),
    totalPrice
  );

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 animate-[fade-in_0.2s_ease-out]" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 shadow-2xl flex flex-col animate-[slide-in-right_0.3s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="font-heading text-2xl">CARRITO</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Bar */}
        {state.items.length > 0 && (
          <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30">
            {remaining > 0 ? (
              <>
                <p className="text-xs text-neutral-300 mb-1.5">
                  <TruckIcon className="w-4 h-4 inline -mt-0.5" /> ¡Te faltan <span className="text-primary font-bold">{formatPrice(remaining)}</span> para envío <span className="text-green-400 font-bold">GRATIS</span>!
                </p>
                <div className="w-full bg-neutral-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-primary to-green-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-green-400 font-medium flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ¡Envío GRATIS aplicado!
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-3"><ShoppingCartIcon className="w-10 h-10 mx-auto text-neutral-500" /></div>
              <p className="text-neutral-400">Tu carrito está vacío</p>
              <button onClick={onClose} className="text-primary text-sm mt-2 hover:underline">Seguir comprando</button>
            </div>
          ) : (
            state.items.map((item) => {
              const key = `${item.id}-${item.variantId || ""}`;
              return (
                <div key={key} className="flex gap-4 bg-neutral-800/50 rounded-lg p-3 transition-all duration-200 hover:bg-neutral-800/80">
                  <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || "/products/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-xs text-neutral-400">{item.variantName}</p>
                    )}
                    <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          dispatch({
                            type: "UPDATE_QUANTITY",
                            payload: { id: item.id, variantId: item.variantId, quantity: item.quantity - 1 },
                          })
                        }
                        className="w-7 h-7 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-sm active:scale-90 transition-transform"
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch({
                            type: "UPDATE_QUANTITY",
                            payload: { id: item.id, variantId: item.variantId, quantity: item.quantity + 1 },
                          })
                        }
                        className="w-7 h-7 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-sm active:scale-90 transition-transform"
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          { gtag.removeFromCart({ item_id: item.id, item_name: item.name, item_variant: item.variantName, price: item.price, quantity: item.quantity }, item.price * item.quantity); dispatch({ type: "REMOVE_ITEM", payload: { id: item.id, variantId: item.variantId } }); }
                        }
                        className="ml-auto text-neutral-500 hover:text-red-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t border-neutral-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400 text-sm">Subtotal</span>
              <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
            </div>
            {/* Trust badges inline */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 py-1">
              <span className="flex items-center gap-1"><LockClosedIcon className="w-3.5 h-3.5" /> Pago seguro</span>
              <span className="flex items-center gap-1"><TruckIcon className="w-3.5 h-3.5" /> Envío rápido</span>
              <span className="flex items-center gap-1"><ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Devoluciones</span>
            </div>
            <Link
              href="/carrito"
              onClick={onClose}
              className="block w-full text-center py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition"
            >
              VER CARRITO
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-premium block w-full text-center py-3 bg-primary text-white font-bold rounded-lg"
            >
              FINALIZAR COMPRA
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
