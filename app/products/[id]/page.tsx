"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, MessageCircle, Trash2, Pencil, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  category_id: any;
  id: string;
  title: string;
  price: number;
  description?: string;
  image_url: string | null;

  category_name?: string | null;
  subcategory_name?: string | null;

  seller_id: string;
  seller?: {
    full_name: string | null;
    avatar_url: string | null;
  };

  status?: "available" | "reserved" | "sold";
}

export default function ProductDetailPage({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const { user } = useSupabase();

  const [product, setProduct] = useState<Product | null>(null);
  const [moreFromSeller, setMoreFromSeller] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  // -----------------------------
  // Cargar producto
  // -----------------------------
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select(`
          id,
          title,
          price,
          description,
          image_url,
          status,
          categories:category_id (name),
          subcategories:subcategory_id (name),
          seller:profiles!products_seller_id_fkey (
            full_name,
            avatar_url
          ),
          seller_id,
          category_id
        `)
        .eq("id", id)
        .single();

      if (data) {
        const mapped: Product = {
          ...data,
          category_name: data.categories?.[0]?.name || null,
          subcategory_name: data.subcategories?.[0]?.name || null,
          seller: data.seller?.[0] || null,
        };

        setProduct(mapped);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // -----------------------------
  // Favoritos
  // -----------------------------
  useEffect(() => {
    if (!user || !product) return;

    async function loadFavorite() {
      const productId = product!.id;

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      setIsFavorite(!!data);
    }

    loadFavorite();
  }, [user, product]);

  async function toggleFavorite() {
    if (!user) return router.push("/auth/login");
    if (!product) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      setIsFavorite(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: product.id,
      });

      setIsFavorite(true);
    }
  }

  // -----------------------------
  // Más del vendedor
  // -----------------------------
  useEffect(() => {
    if (!product) return;
    const currentProduct = product;

    async function loadMore() {
      const sellerId = currentProduct.seller_id;
      const productId = currentProduct.id;

      const { data } = await supabase
        .from("products")
        .select("id, title, price, image_url, status")
        .eq("seller_id", sellerId)
        .neq("id", productId)
        .order("inserted_at", { ascending: false })
        .limit(6);

      if (data) setMoreFromSeller(data);
    }

    loadMore();
  }, [product]);

  // -----------------------------
  // Relacionados
  // -----------------------------
  useEffect(() => {
    if (!product || !product.category_id) return;
    const currentProduct = product;

    async function loadRelated() {
      const categoryId = currentProduct.category_id;
      const productId = currentProduct.id;

      const { data } = await supabase
        .from("products")
        .select("id, title, price, image_url, status")
        .eq("category_id", categoryId)
        .neq("id", productId)
        .limit(6);

      if (data) setRelated(data);
    }

    loadRelated();
  }, [product]);

  // -----------------------------
  // Chat
  // -----------------------------
  async function handleChat() {
    if (!user) return router.push("/auth/login");
    if (!product) return;

    if (product.status === "sold") {
      return alert("Este producto ya fue vendido");
    }

    if (user.id === product.seller_id) {
      return alert("No podés chatear con vos mismo");
    }

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: user.id,
        seller_id: product.seller_id,
        product_id: product.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error creando conversación:", data.error);
      return alert("Error creando conversación");
    }

    router.push(`/chat/${data.conversation.id}`);
  }

  // -----------------------------
  // Delete
  // -----------------------------
  async function handleDelete() {
    if (!product) return;

    const confirmDelete = confirm("¿Seguro que querés eliminar este producto?");
    if (!confirmDelete) return;

    setDeleting(true);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    setDeleting(false);

    if (error) {
      alert("Error eliminando producto");
      return;
    }

    router.push("/profile/my-products");
  }

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading || !product) {
    return (
      <p className="text-center text-[var(--text-muted)] mt-20 animate-pulse">
        Cargando producto...
      </p>
    );
  }

  const categoryLabel = product.subcategory_name
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
    <div className="space-y-20">

      {/* PRODUCTO */}
      <motion.div
        className="grid lg:grid-cols-2 gap-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* IMAGE */}
        <motion.div
          className="relative h-[450px] w-full rounded-2xl overflow-hidden 
                     bg-[var(--surface)] border border-[var(--border)] 
                     shadow-xl shadow-[var(--shadow-strong)]"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >

          {/* ❤️ FAVORITE BUTTON */}
          {user && (
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 z-20 p-3 rounded-full 
                         bg-[var(--surface)]/70 backdrop-blur 
                         border border-[var(--border)] 
                         hover:bg-[var(--surface-hover)] transition"
            >
              <Heart
                size={24}
                className={`transition ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-[var(--text)]"
                }`}
              />
            </button>
          )}

          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover object-center"
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full 
                            bg-[var(--surface-hover)] text-[var(--text-muted)]">
              <ImageOff size={50} />
            </div>
          )}

          {/* CATEGORY */}
          <span
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs 
                       bg-[var(--surface)]/70 backdrop-blur 
                       text-[var(--text-muted)] border border-[var(--border)]"
          >
            {categoryLabel}
          </span>

          {/* STATUS BADGE */}
          {product.status && (
            <span
              className={`absolute bottom-4 left-4 px-3 py-1 rounded-full 
                          text-xs font-medium border shadow 
                          ${statusColors[product.status]}`}
            >
              {statusLabel[product.status]}
            </span>
          )}
        </motion.div>

        {/* INFO */}
        <div className="space-y-8">

          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-[var(--text)]">
              {product.title}
            </h1>
            <p className="text-[var(--text-muted)] mt-2 text-lg">
              {categoryLabel}
            </p>
          </div>

          <p className="text-green-500 text-5xl font-bold tracking-tight">
            ${product.price.toLocaleString("es-AR")}
          </p>

          <p className="text-[var(--text)] leading-relaxed text-lg">
            {product.description || "Sin descripción."}
          </p>

          {/* ESTADO */}
          {product.status === "reserved" && (
            <p className="text-yellow-400 font-semibold">
              Este producto está reservado.
            </p>
          )}

          {product.status === "sold" && (
            <p className="text-red-400 font-semibold">
              Este producto ya fue vendido.
            </p>
          )}

          {/* SELLER */}
          {product.seller && (
            <Link
              href={`/profile/${product.seller_id}`}
              className="flex items-center gap-4 mt-6 group"
            >
              <div
                className="relative w-14 h-14 rounded-full overflow-hidden 
                           border border-[var(--border)] 
                           group-hover:scale-105 transition"
              >
                {product.seller.avatar_url ? (
                  <Image
                    src={product.seller.avatar_url}
                    alt="Vendedor"
                    fill
                    className="object-cover object-center"
                    quality={90}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full 
                                  bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    <ImageOff size={28} />
                  </div>
                )}
              </div>

              <div>
                <p className="text-[var(--text)] font-semibold group-hover:underline">
                  {product.seller.full_name || "Vendedor"}
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  Ver perfil del vendedor
                </p>
              </div>
            </Link>
          )}

          {/* CTA */}
          {user?.id === product.seller_id ? (
            <div className="space-y-4">
              <p className="text-[var(--text-muted)] italic">
                Este producto es tuyo.
              </p>

              <div className="flex gap-4">
                <Link
                  href={`/products/edit/${product.id}`}
                  className="inline-flex items-center gap-2 
                             bg-[var(--surface)] hover:bg-[var(--surface-hover)] 
                             border border-[var(--border)]
                             transition px-6 py-3 rounded-xl 
                             font-medium text-[var(--text)] text-lg"
                >
                  <Pencil size={20} />
                  Editar
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 
                             bg-red-600 hover:bg-red-500 
                             transition px-6 py-3 rounded-xl 
                             font-medium text-white text-lg disabled:opacity-50"
                >
                  <Trash2 size={20} />
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          ) : product.status === "sold" ? (
            <p className="text-red-400 font-semibold">
              Este producto ya fue vendido.
            </p>
          ) : (
            <motion.button
              onClick={handleChat}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 
                         bg-blue-600 hover:bg-blue-500 
                         transition px-8 py-4 rounded-xl 
                         font-medium text-white text-lg 
                         shadow-lg shadow-blue-600/20"
            >
              <MessageCircle size={22} />
              Chatear con el vendedor
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* MÁS DEL VENDEDOR */}
      {moreFromSeller.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text)]">
            Más del vendedor
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {moreFromSeller.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="rounded-2xl overflow-hidden 
                           bg-[var(--surface)] border border-[var(--border)]
                           hover:border-[var(--accent)]/40 
                           transition-all duration-300 
                           shadow-lg hover:shadow-xl"
              >
                <div className="relative h-48 w-full">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover object-center"
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full 
                                    bg-[var(--surface-hover)] text-[var(--text-muted)]">
                      <ImageOff size={40} />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg truncate text-[var(--text)]">
                    {p.title}
                  </h3>

                  <p className="text-green-500 font-bold text-xl">
                    ${p.price.toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text)]">
            Productos relacionados
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="rounded-2xl overflow-hidden 
                           bg-[var(--surface)] border border-[var(--border)]
                           hover:border-[var(--accent)]/40 
                           transition-all duration-300 
                           shadow-lg hover:shadow-xl"
              >
                <div className="relative h-48 w-full">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover object-center"
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full 
                                    bg-[var(--surface-hover)] text-[var(--text-muted)]">
                      <ImageOff size={40} />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg truncate text-[var(--text)]">
                    {p.title}
                  </h3>

                  <p className="text-green-500 font-bold text-xl">
                    ${p.price.toLocaleString("es-AR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
