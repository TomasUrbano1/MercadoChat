"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  category: string;
  image_url: string | null;
  seller_id: string;
}

export default function ProductDetailPage({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const { user } = useSupabase();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar producto real
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProduct(data);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handleChat() {
    if (!user) return router.push("/auth/login");

    // Evitar que el vendedor se chatee a sí mismo
    if (user.id === product?.seller_id) {
      return alert("No podés chatear con vos mismo");
    }

    // Crear conversación real
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: user.id,
        seller_id: product?.seller_id,
        product_id: product?.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Error creando conversación");
    }

    router.push(`/chat/${data.id}`);
  }

  if (loading) {
    return (
      <p className="text-center text-zinc-400 mt-20 animate-pulse">
        Cargando producto...
      </p>
    );
  }

  if (!product) {
    return (
      <p className="text-center text-zinc-400 mt-20">
        Producto no encontrado.
      </p>
    );
  }

  const hasImage = Boolean(product.image_url);

  return (
    <motion.div
      className="grid lg:grid-cols-2 gap-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* IMAGE */}
      <motion.div
        className="relative h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/30"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {hasImage ? (
          <Image
            src={product.image_url!}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-zinc-800 text-zinc-500">
            <ImageOff size={50} />
          </div>
        )}

        {/* CATEGORY BADGE */}
        <span className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-zinc-200 border border-white/10">
          {product.category}
        </span>
      </motion.div>

      {/* INFO */}
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            {product.title}
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">{product.category}</p>
        </div>

        <p className="text-green-400 text-5xl font-bold tracking-tight">
          ${product.price.toLocaleString("es-AR")}
        </p>

        <p className="text-zinc-300 leading-relaxed text-lg">
          {product.description || "Sin descripción."}
        </p>

        {/* CTA */}
        {user?.id === product.seller_id ? (
          <p className="text-zinc-500 italic">
            Este producto es tuyo. No podés iniciar un chat.
          </p>
        ) : (
          <motion.button
            onClick={handleChat}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition px-8 py-4 rounded-xl font-medium text-white text-lg shadow-lg shadow-blue-600/20"
          >
            <MessageCircle size={22} />
            Chatear con el vendedor
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
