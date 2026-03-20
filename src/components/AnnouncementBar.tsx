"use client";

import { useState, useEffect, useRef } from "react";

const messages = [
  "Envío a toda Colombia — Bogotá 1-2 días",
  "Cambios de talla gratis en los primeros 15 días",
  "Pago contra entrega disponible",
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFirst(false);
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-primary text-white text-center py-2 text-xs sm:text-sm font-medium tracking-wide">
      <div className="max-w-7xl mx-auto px-4">
        <span key={current} className={isFirst ? "inline-block" : "inline-block animate-fade-in"}>
          {messages[current]}
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
