"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
}

interface CartState {
  items: CartProduct[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartProduct }
  | { type: "REMOVE_ITEM"; payload: { id: string; variantId?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; variantId?: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "TOGGLE_CART" }
  | { type: "SET_ITEMS"; payload: CartProduct[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = `${action.payload.id}-${action.payload.variantId || ""}`;
      const existing = state.items.findIndex(
        (i) => `${i.id}-${i.variantId || ""}` === key
      );
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: items[existing].quantity + action.payload.quantity,
        };
        return { ...state, items, isOpen: true };
      }
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }
    case "REMOVE_ITEM": {
      const key = `${action.payload.id}-${action.payload.variantId || ""}`;
      return {
        ...state,
        items: state.items.filter(
          (i) => `${i.id}-${i.variantId || ""}` !== key
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const key = `${action.payload.id}-${action.payload.variantId || ""}`;
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => `${i.id}-${i.variantId || ""}` !== key
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          `${i.id}-${i.variantId || ""}` === key
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  totalItems: number;
  totalPrice: number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  useEffect(() => {
    const saved = localStorage.getItem("sequoia-cart");
    if (saved) {
      try {
        dispatch({ type: "SET_ITEMS", payload: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sequoia-cart", JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
