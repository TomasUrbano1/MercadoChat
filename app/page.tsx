"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

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
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-blue-600/20 via-zinc-950 to-zinc-950 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 -left-10 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr,1fr] items-center px-6 py-12 md:px-10 md:py-16">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              MercadoChat está en beta, pero ya se está usando para vender.
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                El marketplace que se siente como chat.
              </h1>
              <p className="text-zinc-300 text-base md:text-lg max-w-xl">
                Publicá lo que quieras, hablá directo con la otra persona y
                cerrá la venta en minutos. Sin vueltas, sin formularios eternos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/products/new"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 transition px-7 py-3 rounded-xl text-white font-medium text-base shadow-lg shadow-blue-600/40 w-full sm:w-auto"
              >
                Publicar producto
              </Link>
              <Link
                href="/products"
                className="text-zinc-300 hover:text-white transition text-sm"
              >
                Ver productos en vivo →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left text-xs md:text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-zinc-400">Respuesta promedio</p>
                <p className="text-white font-semibold mt-1">
                  &lt; 5 minutos
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-zinc-400">Publicar tarda</p>
                <p className="text-white font-semibold mt-1">
                  menos de 1 minuto
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p className="text-zinc-400">Pensado para</p>
                <p className="text-white font-semibold mt-1">
                  ventas rápidas
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: chat preview */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/70 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold">
                    MC
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Chat con vendedor
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Respuesta rápida garantizada
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500">
                  Vista previa
                </span>
              </div>

              <div className="px-4 py-4 space-y-3 text-sm">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-bl-sm w-fit">
                  Hola, ¿sigue disponible el iPhone?
                </div>
                <div className="bg-zinc-800 text-white px-4 py-2 rounded-2xl rounded-br-sm w-fit ml-auto">
                  Sí, está impecable. ¿De dónde sos?
                </div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-bl-sm w-fit">
                  De La Rioja, ¿hacés envío?
                </div>
              </div>

              <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-zinc-400">
                <MessageCircle size={14} className="text-blue-400" />
                <span>Todo pasa por el chat. Nada se pierde.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH + CATEGORIES */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Buscá algo puntual</h2>
            <p className="text-zinc-400 text-sm">
              Filtrá por título, categoría o explorá lo que ya está publicado.
            </p>
          </div>

          <div className="flex-1 max-w-md">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 gap-2 shadow-lg shadow-black/40">
              <Search className="text-zinc-500" size={18} />
              <input
                placeholder="Buscar por título o categoría..."
                className="flex-1 bg-transparent outline-none text-white text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Filter size={14} />
            <span>Filtrar por categoría</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  category === cat
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/40"
                    : "bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="space-y-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">
          Pensado para cerrar ventas rápido
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            className="surface p-7 text-center hover:border-zinc-500/80 transition rounded-2xl"
            whileHover={{ y: -4 }}
          >
            <MessageCircle size={36} className="mx-auto text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat primero</h3>
            <p className="text-zinc-400 text-sm">
              Nada de mensajes perdidos. Todo pasa por el chat, en tiempo real.
            </p>
          </motion.div>

          <motion.div
            className="surface p-7 text-center hover:border-zinc-500/80 transition rounded-2xl"
            whileHover={{ y: -4 }}
          >
            <Zap size={36} className="mx-auto text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Publicar es cuestión de segundos
            </h3>
            <p className="text-zinc-400 text-sm">
              Foto, título, precio y listo. Sin formularios eternos ni pasos
              raros.
            </p>
          </motion.div>

          <motion.div
            className="surface p-7 text-center hover:border-zinc-500/80 transition rounded-2xl"
            whileHover={{ y: -4 }}
          >
            <ShieldCheck size={36} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todo bajo control</h3>
            <p className="text-zinc-400 text-sm">
              Tus publicaciones y chats quedan ordenados. Sabés siempre en qué
              quedó cada conversación.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="text-orange-400" />
          <h2 className="text-2xl font-semibold">Trending ahora</h2>
        </div>
        <p className="text-zinc-400 text-sm mb-3">
          Lo que más se está mirando y preguntando en este momento.
        </p>

        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 surface animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : trendingProducts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            Cuando haya más movimiento, vas a ver los productos calientes acá.
          </p>
        )}
      </section>

      {/* PRODUCTOS + FILTROS (GRID PRINCIPAL) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Explorar productos
            </h2>
            <p className="text-zinc-400 text-sm">
              Lo último que se publicó en MercadoChat.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 surface animate-pulse rounded-xl"
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
            No encontramos productos para esa búsqueda. Probá con otra palabra o
            categoría.
          </p>
        )}
      </section>

      {/* TESTIMONIOS */}
      <section className="space-y-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">
          Gente que ya lo usó
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
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
              className="surface p-7 hover:border-zinc-500/80 transition rounded-2xl"
              whileHover={{ y: -4 }}
            >
              <Star className="text-yellow-400 mb-3" />
              <p className="text-zinc-300 mb-4 text-sm">“{t.text}”</p>
              <p className="text-zinc-500 text-sm">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-16 border-t border-white/10 mt-4">
        <h3 className="text-3xl md:text-4xl font-semibold mb-4">
          Publicá algo hoy y probá qué pasa.
        </h3>
        <p className="text-zinc-400 mb-8 text-lg max-w-2xl mx-auto">
          No necesitás armar una tienda. Solo subís un producto y empezás a
          chatear. El resto se resuelve hablando.
        </p>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 transition px-10 py-4 rounded-xl text-white font-medium text-lg shadow-lg shadow-blue-600/30"
        >
          Crear publicación
        </Link>
      </section>
    </main>
  );
}
