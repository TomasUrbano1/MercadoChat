"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabase } from "@/components/SupabaseProvider";
import { Loader2, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useSupabase();
  

    useEffect(() => {
    async function test() {
      const res = await supabase.storage.from("products").list();
      console.log("Storage test:", res);
    }
    test();
  }, []);


  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });

  async function handleSubmit() {
    if (!user) return alert("Tenés que iniciar sesión");

    if (!form.title || !form.price || !form.category) {
      return alert("Completá los campos obligatorios");
    }

    setLoading(true);

    let image_url = "";

    // SUBIR IMAGEN A SUPABASE STORAGE
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error(uploadError);
        alert("Error subiendo imagen");
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      image_url = publicUrl.publicUrl;
    }

    // GUARDAR PRODUCTO EN SUPABASE
    const { data, error } = await supabase
      .from("products")
      .insert({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image_url,
        seller_id: user.id,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Error publicando producto");
      return;
    }

    router.push(`/products/${data.id}`);
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
          Nuevo producto
        </h1>
        <p className="text-zinc-400 text-lg">
          Publicá tu artículo en minutos.
        </p>
      </div>

      <div className="space-y-6">
        {/* INPUTS */}
        <input
          placeholder="Título del producto"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Descripción (opcional)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white h-32 focus:border-blue-500 transition"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          placeholder="Precio"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          placeholder="Categoría"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        {/* IMAGE UPLOAD */}
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
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 transition px-6 py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 w-full text-lg shadow-lg shadow-blue-600/20"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Publicar producto
        </button>
      </div>
    </motion.div>
  );
}
