"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category?: string;
}

export function ProductCard({
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
}: ProductCardProps) {
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link
      href={`/producto/${slug}`}
      className="group block transition-transform duration-300 ease-out hover:-translate-y-2"
    >
      <div className="relative aspect-square bg-neutral-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10">
        <Image
          src={image || "/products/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
            -{discount}%
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        {/* Quick view hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="bg-white/95 backdrop-blur-sm text-neutral-900 text-xs font-bold px-4 py-2 rounded-full shadow-xl uppercase tracking-wider">
            Ver producto
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {category && (
          <p className="text-xs text-neutral-500 uppercase tracking-wider transition-colors duration-200 group-hover:text-primary/70">
            {category}
          </p>
        )}
        <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors duration-200 line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold transition-transform duration-200 inline-block group-hover:scale-105 origin-left">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-neutral-500 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
