"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ImageOff, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  status?: "available" | "reserved" | "sold";

  category_name?: string | null;
  subcategory_name?: string | null;

  is_favorite?: boolean;
  toggleFavorite?: () => void;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [error, setError] = useState(false);

  const categoryLabel =
    product.subcategory_name
      ? `${product.category_name} • ${product.subcategory_name}`
      : product.category_name || "Sin categoría";

  const statusColors: Record<string, string> = {
    available: "bg-green-600/80 text-white border-green-400/30",
    reserved: "bg-yellow-600/80 text-white border-yellow-400/30",
    sold: "bg-red-600/80 text-white border-red-400/30",
  };

  const statusLabel: Record<string, string> = {
    available: "Disponible",
    reserved: "Reservado",
    sold: "Vendido",
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group"
    >
      <div className="relative">

        {/* ❤️ FAVORITE BUTTON */}
        {product.toggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              product.toggleFavorite?.();
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full 
                       bg-[var(--surface)]/70 backdrop-blur 
                       border border-[var(--border)] 
                       hover:bg-[var(--surface-hover)] transition shadow-md"
          >
            <Heart
              size={20}
              className={`transition ${
                product.is_favorite
                  ? "fill-red-500 text-red-500"
                  : "text-[var(--text)]"
              }`}
            />
          </button>
        )}

        <Link
          href={`/products/${product.id}`}
          className="block rounded-2xl overflow-hidden 
                     bg-[var(--surface)] border border-[var(--border)]
                     hover:border-[var(--accent)]/40 
                     transition-all duration-300 
                     shadow-lg hover:shadow-xl"
        >
          {/* IMAGE */}
          <div className="relative h-56 w-full overflow-hidden">
            {!error && product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                quality={90}
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={() => setError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full 
                              bg-[var(--surface-hover)] text-[var(--text-muted)]">
                <ImageOff size={42} />
              </div>
            )}

            {/* CATEGORY BADGE */}
            <span
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs 
                         bg-[var(--surface)]/70 backdrop-blur 
                         text-[var(--text-muted)] border border-[var(--border)] shadow"
            >
              {categoryLabel}
            </span>

            {/* STATUS BADGE */}
            {product.status && (
              <span
                className={`absolute bottom-3 left-3 px-3 py-1 rounded-full 
                            text-xs font-medium border shadow 
                            ${statusColors[product.status]}`}
              >
                {statusLabel[product.status]}
              </span>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-lg truncate text-[var(--text)]">
              {product.title}
            </h3>

            <p className="text-green-500 font-bold text-2xl tracking-tight">
              ${product.price.toLocaleString("es-AR")}
            </p>

            <p className="text-[var(--text-muted)] text-xs group-hover:text-[var(--text)] transition">
              Ver detalles →
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
