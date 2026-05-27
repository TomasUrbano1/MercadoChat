"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicProfilePage({ params }: any) {
  const { id } = params;
  const { user } = useSupabase();

  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar perfil público
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setProfile(data);
    }

    loadProfile();
  }, [id]);

  // Cargar productos del vendedor
  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select(`
          id,
          title,
          price,
          image_url,
          categories:category_id (name),
          subcategories:subcategory_id (name)
        `)
        .eq("seller_id", id)
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

    loadProducts();
  }, [id]);

  async function handleChat() {
    if (!user) return alert("Tenés que iniciar sesión para chatear");

    if (user.id === id) {
      return alert("No podés chatear con vos mismo");
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: user.id,
        seller_id: id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Error creando conversación");
    }

    window.location.href = `/chat/${data.id}`;
  }

  if (loading || !profile) {
    return (
      <p className="text-center text-[var(--text-muted)] mt-20 animate-pulse">
        Cargando perfil...
      </p>
    );
  }

  return (
    <motion.div
      className="space-y-16 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center gap-6">
        <div
          className="
            relative w-32 h-32 rounded-full overflow-hidden 
            border border-[var(--border)] shadow-xl bg-[var(--surface)]
          "
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)]">
              <ImageOff size={40} />
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text)]">
            {profile.full_name || "Usuario sin nombre"}
          </h1>

          {profile.city && profile.province && (
            <p className="text-[var(--text-muted)]">
              {profile.city}, {profile.province}
            </p>
          )}

          {profile.bio && (
            <p className="text-[var(--text)] max-w-md mx-auto opacity-90">
              {profile.bio}
            </p>
          )}
        </div>

        {/* CTA */}
        {user?.id !== id && (
          <motion.button
            onClick={handleChat}
            whileTap={{ scale: 0.97 }}
            className="
              inline-flex items-center gap-2 
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              transition px-8 py-4 rounded-xl 
              font-medium text-white text-lg shadow-lg shadow-[var(--accent)]/20
            "
          >
            <MessageCircle size={22} />
            Chatear con {profile.full_name?.split(" ")[0] || "el vendedor"}
          </motion.button>
        )}
      </div>

      {/* PRODUCTS */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-[var(--text)]">Publicaciones</h2>

        {products.length === 0 ? (
          <p className="text-[var(--text-muted)]">
            Este usuario no tiene productos publicados.
          </p>
        ) : (
          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08 },
              },
            }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="
                    block rounded-2xl overflow-hidden 
                    bg-[var(--surface)] border border-[var(--border)]
                    hover:border-[var(--accent)]/40 
                    transition-all duration-300 
                    shadow-lg hover:shadow-xl
                  "
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-[var(--surface-hover)] text-[var(--text-muted)]">
                        <ImageOff size={40} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-lg truncate text-[var(--text)]">
                      {product.title}
                    </h3>

                    <p className="text-green-500 font-bold text-xl">
                      ${product.price.toLocaleString("es-AR")}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
