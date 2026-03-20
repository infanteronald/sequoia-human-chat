"use client";

import { useRef, useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category: string;
}

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth || 300;
    el.scrollBy({ left: direction === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-full flex items-center justify-center text-white hover:bg-neutral-800 transition opacity-0 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-full flex items-center justify-center text-white hover:bg-neutral-800 transition opacity-0 group-hover:opacity-100"
          aria-label="Siguiente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-16 snap-x snap-mandatory"
      >
        {products.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-[65vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] snap-start">
            <ProductCard
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              image={p.image}
              category={p.category}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
