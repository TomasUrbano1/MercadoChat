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

  // Imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Categorías
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Form
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

  // Cargar subcategorías cuando cambia la categoría
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

    // SUBIR NUEVA IMAGEN
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

    // ACTUALIZAR PRODUCTO
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
      <p className="text-center text-zinc-400 mt-20 animate-pulse">
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
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Editar producto
        </h1>
        <p className="text-zinc-400 text-lg">
          Modificá la información de tu publicación.
        </p>
      </div>

      <div className="space-y-6">
        {/* TÍTULO */}
        <input
          placeholder="Título del producto"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* DESCRIPCIÓN */}
        <textarea
          placeholder="Descripción"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white h-32 focus:border-blue-500 transition"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* PRECIO */}
        <input
          type="number"
          placeholder="Precio"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        {/* CATEGORÍA */}
        <select
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
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
          <label className="text-zinc-400 text-sm">Imagen del producto</label>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-zinc-700 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-zinc-300 cursor-pointer"
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
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-zinc-800">
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
          className="bg-blue-600 hover:bg-blue-500 transition px-6 py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 w-full text-lg shadow-lg shadow-blue-600/20"
        >
          {saving && <Loader2 className="animate-spin" size={20} />}
          Guardar cambios
        </button>
      </div>
    </motion.div>
  );
}
