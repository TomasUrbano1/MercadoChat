"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const { user } = useSupabase();

  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  const [search, setSearch] = useState("");
  const searchRef = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(0);
  const limit = 12;

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Cargar favoritos del usuario
  useEffect(() => {
    if (!user) return;

    async function loadFavorites() {
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (data) {
        setFavorites(data.map((f) => f.product_id));
      }
    }

    loadFavorites();
  }, [user]);

  // Toggle favorito
  async function toggleFavorite(productId: string) {
    if (!user) return alert("Tenés que iniciar sesión");

    const isFav = favorites.includes(productId);

    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      setFavorites((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      });

      setFavorites((prev) => [...prev, productId]);
    }
  }

  // Cargar categorías
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (data) setCategories(data);
    }

    loadCategories();
  }, []);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory("");
      return;
    }

    async function loadSubcategories() {
      const { data } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory)
        .order("name", { ascending: true });

      if (data) setSubcategories(data);
    }

    loadSubcategories();
  }, [selectedCategory]);

  // Cargar productos (paginado)
  async function fetchProducts(reset = false) {
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    const from = reset ? 0 : page * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("products")
      .select(
        `
        id,
        title,
        price,
        image_url,
        description,
        status,
        category_id,
        subcategory_id,
        categories:category_id (name),
        subcategories:subcategory_id (name)
      `
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    // FILTROS
    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    if (selectedSubcategory) {
      query = query.eq("subcategory_id", selectedSubcategory);
    }

    // Mostrar productos sin categoría si no hay filtros
    if (!selectedCategory && !selectedSubcategory) {
      query = query.or("category_id.is.null,subcategory_id.is.null");
    }

    // BÚSQUEDA
    if (search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data } = await query;

    if (data) {
      const mapped = data.map((p) => ({
        ...p,
        category_name: p.categories?.[0]?.name || null,
        subcategory_name: p.subcategories?.[0]?.name || null,
        is_favorite: favorites.includes(p.id),
      }));

      if (reset) {
        setProducts(mapped);
      } else {
        setProducts((prev) => [...prev, ...mapped]);
      }
    }

    setLoading(false);
    setLoadingMore(false);
  }

  // Recargar cuando cambian filtros o búsqueda
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);

    searchRef.current = setTimeout(() => {
      fetchProducts(true);
    }, 300);

    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [selectedCategory, selectedSubcategory, search, favorites]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loadingMore]);

  // Cargar más cuando cambia la página
  useEffect(() => {
    if (page === 0) return;
    fetchProducts(false);
  }, [page]);

  // Filtrar favoritos
  const visibleProducts = showFavoritesOnly
    ? products.filter((p) => favorites.includes(p.id))
    : products;

  return (
    <div className="space-y-20">
      {/* HEADER */}
      <motion.header
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-extrabold tracking-tight">
          Productos
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Explorá los artículos publicados por la comunidad. Todo en un solo lugar.
        </p>
      </motion.header>

      {/* SEARCH */}
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FAVORITOS TOGGLE */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
          className={`px-6 py-2 rounded-xl border transition ${
            showFavoritesOnly
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
          }`}
        >
          {showFavoritesOnly ? "Mostrar todos" : "Mostrar favoritos"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition w-full sm:w-64"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("");
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition w-full sm:w-64"
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          disabled={subcategories.length === 0}
        >
          <option value="">Todas las subcategorías</option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <section>
        {loading ? (
          <p className="text-center text-zinc-400">Cargando productos...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-zinc-400">
            No hay productos que coincidan con la búsqueda o los filtros.
          </p>
        ) : (
          <>
            <motion.div
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard
                    product={{
                      ...product,
                      is_favorite: favorites.includes(product.id),
                      toggleFavorite: () => toggleFavorite(product.id),
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Loader para infinite scroll */}
            <div ref={loaderRef} className="py-10 text-center text-zinc-500">
              {loadingMore && "Cargando más productos..."}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
