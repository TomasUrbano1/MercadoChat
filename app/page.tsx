"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url: string | null;
  created_at?: string;
};

const CATEGORIES = [
  "Todos",
  "Tecnología",
  "Hogar",
  "Moda",
  "Deportes",
  "Vehículos",
  "Otros",
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setProducts(data);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchCategory =
        category === "Todos" || p.category === category;
      return matchQuery && matchCategory;
    });
  }, [products, query, category]);

  const trendingProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  return (
    <div className="space-y-32">
      {/* HERO ANIMADO */}
      <section className="relative py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/15 via-zinc-900/40 to-zinc-950" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            El marketplace que se siente como chat.
          </motion.h1>

          <motion.p
            className="text-zinc-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Publicá lo que quieras, hablá directo con la otra persona y cerrá
            la venta en minutos. Sin vueltas, sin formularios eternos.
          </motion.p>

          {/* CTA PRINCIPAL */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href="/products/new"
              className="inline-block bg-blue-600 hover:bg-blue-500 transition px-8 py-4 rounded-xl text-white font-medium text-lg shadow-lg shadow-blue-600/30"
            >
              Publicar producto
            </Link>
            <Link
              href="/products"
              className="text-zinc-300 hover:text-white transition text-sm"
            >
              Ver productos en vivo →
            </Link>
          </motion.div>

          {/* BUSCADOR */}
          <motion.div
            className="max-w-xl mx-auto flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 gap-3 shadow-lg shadow-black/30 backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Search className="text-zinc-500" size={20} />
            <input
              placeholder="Buscar por título o categoría..."
              className="flex-1 bg-transparent outline-none text-white text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </motion.div>

          {/* MOCKUP DEL CHAT */}
          <motion.div
            className="mt-16 mx-auto max-w-3xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-zinc-900/70 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                  MC
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    Chat con vendedor
                  </p>
                  <p className="text-xs text-zinc-400">
                    Respuesta promedio: menos de 5 minutos
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500">
                Vista previa del chat
              </span>
            </div>

            <div className="p-5 space-y-3 text-left">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl w-fit text-sm">
                Hola, ¿sigue disponible el iPhone?
              </div>
              <div className="bg-zinc-700 text-white px-4 py-2 rounded-xl w-fit ml-auto text-sm">
                Sí, está impecable. ¿De dónde sos?
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-xl w-fit text-sm">
                De La Rioja, ¿hacés envío?
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES PREMIUM */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          Pensado para cerrar ventas rápido
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <motion.div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-600 transition"
            whileHover={{ y: -4 }}
          >
            <MessageCircle size={40} className="mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat primero</h3>
            <p className="text-zinc-400 text-sm">
              Nada de mensajes perdidos. Todo pasa por el chat, en tiempo real.
            </p>
          </motion.div>

          <motion.div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-600 transition"
            whileHover={{ y: -4 }}
          >
            <Zap size={40} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Publicar es cuestión de segundos</h3>
            <p className="text-zinc-400 text-sm">
              Foto, título, precio y listo. Sin formularios eternos ni pasos raros.
            </p>
          </motion.div>

          <motion.div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-600 transition"
            whileHover={{ y: -4 }}
          >
            <ShieldCheck size={40} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Todo bajo control</h3>
            <p className="text-zinc-400 text-sm">
              Tus publicaciones y chats quedan ordenados. Sabés siempre en qué quedó cada conversación.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TRENDING AHORA */}
      <section className="max-w-7xl mx-auto px-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="text-orange-400" />
          <h2 className="text-2xl font-semibold">Trending ahora</h2>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          Lo que más se está mirando y preguntando en este momento.
        </p>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            {trendingProducts.map((product) => (
              <div key={product.id} className="min-w-[260px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            Cuando haya más movimiento, vas a ver los productos calientes acá.
          </p>
        )}
      </section>

      {/* PRODUCTOS + FILTROS */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-3xl font-semibold">Explorar productos</h2>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Filter size={16} />
            <span>Filtrar por categoría</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                category === cat
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center">
            No encontramos productos para esa búsqueda. Probá con otra palabra o categoría.
          </p>
        )}
      </section>

      {/* TESTIMONIOS */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-12 text-center">
          Gente que ya lo usó
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              name: "Lucía",
              text: "Vendí mi notebook en menos de 24 horas. El chat hizo toda la diferencia.",
            },
            {
              name: "Martín",
              text: "Compré una bici y coordiné todo en 5 minutos. Cero drama, cero vueltas.",
            },
            {
              name: "Carla",
              text: "La app se siente rápida y clara. Publicar algo nuevo no da paja.",
            },
          ].map((t) => (
            <motion.div
              key={t.name}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition"
              whileHover={{ y: -4 }}
            >
              <Star className="text-yellow-400 mb-3" />
              <p className="text-zinc-300 mb-4 text-sm">“{t.text}”</p>
              <p className="text-zinc-500 text-sm">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA FINAL PREMIUM */}
      <section className="text-center py-28 border-t border-white/10">
        <h3 className="text-4xl font-semibold mb-4">
          Publicá algo hoy y probá qué pasa.
        </h3>
        <p className="text-zinc-400 mb-8 text-lg">
          No necesitás armar una tienda. Solo subís un producto y empezás a chatear.
        </p>
        <Link
          href="/products/new"
          className="bg-blue-600 hover:bg-blue-500 transition px-10 py-4 rounded-xl text-white font-medium text-xl shadow-lg shadow-blue-600/25"
        >
          Crear publicación
        </Link>
      </section>
    </div>
  );
}
