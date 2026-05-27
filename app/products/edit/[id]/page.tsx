"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { Loader2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function EditProductPage({ params }: any) {
  const { id } = params;
  const router = useRouter();
  const { user } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    image_url: "",
  });

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

  // Cargar producto
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Producto no encontrado");
        router.push("/products");
        return;
      }

      if (data.seller_id !== user?.id) {
        alert("No podés editar este producto");
        router.push("/products");
        return;
      }

      setForm({
        title: data.title,
        description: data.description || "",
        price: data.price,
        category_id: data.category_id || "",
        subcategory_id: data.subcategory_id || "",
        image_url: data.image_url || "",
      });

      setPreview(data.image_url || null);
      setLoading(false);
    }

    if (user) loadProduct();
  }, [id, user]);

  // Cargar subcategorías
  useEffect(() => {
    if (!form.category_id) {
      setSubcategories([]);
      setForm((prev) => ({ ...prev, subcategory_id: "" }));
      return;
    }

    async function loadSubcategories() {
      const { data } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", form.category_id)
        .order("name", { ascending: true });

      if (data) setSubcategories(data);
    }

    loadSubcategories();
  }, [form.category_id]);

  async function handleSave() {
    if (!user) return alert("Tenés que iniciar sesión");

    if (!form.title || !form.price || !form.category_id) {
      return alert("Completá los campos obligatorios");
    }

    setSaving(true);

    let image_url = form.image_url;

    // Subir nueva imagen
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("Error subiendo imagen");
        setSaving(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      image_url = publicUrl.publicUrl;
    }

    // Actualizar producto
    const { error } = await supabase
      .from("products")
      .update({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category_id: form.category_id,
        subcategory_id: form.subcategory_id || null,
        image_url,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Error guardando cambios");
      return;
    }

    router.push(`/products/${id}`);
  }

  if (loading) {
    return (
      <p className="text-center text-[var(--text-muted)] mt-20 animate-pulse">
        Cargando producto...
      </p>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight text-[var(--text)]">
          Editar producto
        </h1>
        <p className="text-[var(--text-muted)] text-lg">
          Modificá la información de tu publicación.
        </p>
      </div>

      <div className="space-y-6">
        {/* TÍTULO */}
        <input
          placeholder="Título del producto"
          className="
            w-full bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            placeholder-[var(--text-muted)]
            focus:border-[var(--accent)] transition
          "
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* DESCRIPCIÓN */}
        <textarea
          placeholder="Descripción"
          className="
            w-full bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)] h-32
            placeholder-[var(--text-muted)]
            focus:border-[var(--accent)] transition
          "
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* PRECIO */}
        <input
          type="number"
          placeholder="Precio"
          className="
            w-full bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            placeholder-[var(--text-muted)]
            focus:border-[var(--accent)] transition
          "
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        {/* CATEGORÍA */}
        <select
          className="
            w-full bg-[var(--surface)] border border-[var(--border)]
            rounded-xl px-4 py-3 text-[var(--text)]
            placeholder-[var(--text-muted)]
            focus:border-[var(--accent)] transition
          "
          value={form.category_id}
          onChange={(e) =>
            setForm({
              ...form,
              category_id: e.target.value,
              subcategory_id: "",
            })
          }
        >
          <option value="">Seleccioná una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* SUBCATEGORÍA */}
        {subcategories.length > 0 && (
          <select
            className="
              w-full bg-[var(--surface)] border border-[var(--border)]
              rounded-xl px-4 py-3 text-[var(--text)]
              placeholder-[var(--text-muted)]
              focus:border-[var(--accent)] transition
            "
            value={form.subcategory_id}
            onChange={(e) =>
              setForm({ ...form, subcategory_id: e.target.value })
            }
          >
            <option value="">Seleccioná una subcategoría</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        )}

        {/* IMAGEN */}
        <div className="space-y-3">
          <label className="text-[var(--text-muted)] text-sm">
            Imagen del producto
          </label>

          <div
            className="
              bg-[var(--surface)] border border-[var(--border)]
              rounded-xl p-4 flex flex-col items-center justify-center gap-3
              text-[var(--text-muted)] hover:bg-[var(--surface-hover)]
              transition cursor-pointer
            "
          >
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm cursor-pointer text-[var(--text)]"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />

            {!preview && (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={28} />
                <p className="text-xs">Seleccioná una imagen</p>
              </div>
            )}

            {preview && (
              <div
                className="
                  relative w-full h-56 rounded-xl overflow-hidden 
                  border border-[var(--border)]
                "
              >
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="
            bg-[var(--accent)] hover:bg-[var(--accent-hover)]
            transition px-6 py-4 rounded-xl text-white font-medium 
            flex items-center justify-center gap-2 disabled:opacity-50 
            w-full text-lg shadow-lg shadow-[var(--accent)]/20
          "
        >
          {saving && <Loader2 className="animate-spin" size={20} />}
          Guardar cambios
        </button>
      </div>
    </motion.div>
  );
}
