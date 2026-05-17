"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | null;

  // NUEVO
  category_name?: string | null;
  subcategory_name?: string | null;
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/products/${product.id}`}
        className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 block"
      >
        {/* IMAGE */}
        <div className="relative h-56 w-full overflow-hidden">
          {!error && product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-zinc-800 text-zinc-500">
              <ImageOff size={42} />
            </div>
          )}

          {/* CATEGORY BADGE */}
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-zinc-200 border border-white/10">
            {categoryLabel}
          </span>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate text-white">
            {product.title}
          </h3>

          <p className="text-green-400 font-bold text-2xl tracking-tight">
            ${product.price.toLocaleString("es-AR")}
          </p>

          <p className="text-zinc-500 text-xs">
            Ver detalles →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
