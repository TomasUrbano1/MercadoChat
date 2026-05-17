"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, Trash2, Pencil, Copy } from "lucide-react";
import { motion } from "framer-motion";

export default function MyProductsPage() {
  const { user } = useSupabase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const totalValue = products.reduce((acc, p) => acc + p.price, 0);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("products")
        .select(`
          id,
          title,
          price,
          image_url,
          description,
          category_id,
          subcategory_id,
          status,
          categories:category_id (name),
          subcategories:subcategory_id (name)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped = data.map((p) => ({
          ...p,
          category_name: p.categories?.[0]?.name || null,
          subcategory_name: p.subcategories?.[0]?.name || null,
        }));

        setProducts(mapped);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  async function handleDelete(id: string) {
    const confirmDelete = confirm("¿Seguro que querés eliminar este producto?");
    if (!confirmDelete) return;

    setDeleting(id);

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Error eliminando producto");
      setDeleting(null);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  async function handleDuplicate(product: any) {
    const confirmDup = confirm("¿Querés duplicar este producto?");
    if (!confirmDup) return;

    setDuplicating(product.id);

    const { data, error } = await supabase
      .from("products")
      .insert({
        title: product.title + " (copia)",
        description: product.description || "",
        price: product.price,
        image_url: product.image_url,
        category_id: product.category_id || null,
        subcategory_id: product.subcategory_id || null,
        seller_id: user?.id,
        status: "available",
      })
      .select()
      .single();

    setDuplicating(null);

    if (error) {
      alert("Error duplicando producto");
      return;
    }

    window.location.href = `/products/edit/${data.id}`;
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingStatus(id);

    const { error } = await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id);

    setUpdatingStatus(null);

    if (error) {
      alert("Error actualizando estado");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      )
    );
  }

  if (!user) {
    return (
      <p className="text-center text-zinc-400 mt-20 text-lg">
        Tenés que iniciar sesión para ver tus productos.
      </p>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Mis productos publicados
        </h1>
        <p className="text-zinc-400 text-lg">
          Administrá tus publicaciones.
        </p>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-white">{products.length}</p>
          <p className="text-zinc-500 mt-1">Productos publicados</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-green-400">
            ${totalValue.toLocaleString("es-AR")}
          </p>
          <p className="text-zinc-500 mt-1">Valor total</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-4xl font-bold text-blue-400">
            {products.filter((p) => p.image_url).length}
          </p>
          <p className="text-zinc-500 mt-1">Con foto</p>
        </div>
      </div>

      {/* LISTADO */}
      {loading ? (
        <p className="text-center text-zinc-400">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-zinc-400">
          Todavía no publicaste ningún producto.
        </p>
      ) : (
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="relative"
            >
              <Link
                href={`/products/${p.id}`}
                className="block bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="relative h-48 w-full">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-zinc-800 text-zinc-500">
                      <ImageOff size={40} />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg truncate text-white">
                    {p.title}
                  </h3>

                  <p className="text-green-400 font-bold text-xl">
                    ${p.price.toLocaleString("es-AR")}
                  </p>

                  {p.category_name && (
                    <p className="text-zinc-500 text-sm">
                      {p.subcategory_name
                        ? `${p.category_name} • ${p.subcategory_name}`
                        : p.category_name}
                    </p>
                  )}
                </div>
              </Link>

              {/* ACTIONS */}
              <div className="absolute top-3 right-3 flex gap-2">
                {/* EDIT */}
                <Link
                  href={`/products/edit/${p.id}`}
                  className="p-2 bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition"
                >
                  <Pencil size={18} className="text-zinc-300" />
                </Link>

                {/* DUPLICATE */}
                <button
                  onClick={() => handleDuplicate(p)}
                  disabled={duplicating === p.id}
                  className="p-2 bg-blue-900/40 border border-blue-800 rounded-xl hover:bg-blue-900/60 transition disabled:opacity-50"
                >
                  <Copy size={18} className="text-blue-400" />
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="p-2 bg-red-900/40 border border-red-800 rounded-xl hover:bg-red-900/60 transition disabled:opacity-50"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>

              {/* 🔥 STATUS SELECTOR */}
              <div className="absolute bottom-3 left-3">
                <select
                  value={p.status || "available"}
                  disabled={updatingStatus === p.id}
                  onChange={(e) =>
                    handleStatusChange(p.id, e.target.value)
                  }
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-lg hover:border-zinc-500 transition"
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservado</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
