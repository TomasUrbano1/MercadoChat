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

  // Cargar favoritos
  useEffect(() => {
    if (!user) return;

    async function loadFavorites() {
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (data) setFavorites(data.map((f) => f.product_id));
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

  // Cargar subcategorías
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

  // Cargar productos
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
      .select(`
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
      `)
      .order("inserted_at", { ascending: false })
      .range(from, to);

    if (selectedCategory) query = query.eq("category_id", selectedCategory);
    if (selectedSubcategory) query = query.eq("subcategory_id", selectedSubcategory);

    if (search.trim() !== "") {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (data) {
      const mapped = data.map((p) => ({
        ...p,
        category_name: p.categories?.[0]?.name || null,
        subcategory_name: p.subcategories?.[0]?.name || null,
        is_favorite: favorites.includes(p.id),
      }));

      if (reset) setProducts(mapped);
      else setProducts((prev) => [...prev, ...mapped]);
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

  // Infinite scroll
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

  useEffect(() => {
    if (page === 0) return;
    fetchProducts(false);
  }, [page]);

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
        <h1 className="text-6xl font-extrabold tracking-tight text-[var(--text)]">
          Productos
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
          Explorá los artículos publicados por la comunidad.
        </p>
      </motion.header>

      {/* SEARCH */}
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="
            w-full bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            placeholder-[var(--text-muted)]
            focus:border-[var(--accent)] transition
          "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FAVORITOS */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
          className={`
            px-6 py-2 rounded-xl border transition
            ${
              showFavoritesOnly
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)]"
            }
          `}
        >
          {showFavoritesOnly ? "Mostrar todos" : "Mostrar favoritos"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <select
          className="
            bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            focus:border-[var(--accent)] transition w-full sm:w-64
          "
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
          className="
            bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            focus:border-[var(--accent)] transition w-full sm:w-64
          "
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
          <p className="text-center text-[var(--text-muted)]">
            Cargando productos...
          </p>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-[var(--text-muted)]">
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
                visible: { transition: { staggerChildren: 0.08 } },
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

            {/* Loader */}
            <div ref={loaderRef} className="py-10 text-center text-[var(--text-muted)]">
              {loadingMore && "Cargando más productos..."}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
