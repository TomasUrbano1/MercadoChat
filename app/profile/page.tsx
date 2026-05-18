"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    city: "",
    province: "",
    avatar_url: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 🔥 Cargar perfil
  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          city: data.city || "",
          province: data.province || "",
          avatar_url: data.avatar_url || "",
        });

        setPreview(data.avatar_url || null);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  // 🔥 Guardar perfil
  async function handleSave() {
    if (!user) return;

    setSaving(true);

    let avatar_url = profile.avatar_url;

    // 🔥 Subir avatar si cambió
    if (avatarFile) {
      const fileName = `${user.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatar_url = `${publicUrl.publicUrl}?v=${Date.now()}`; // cache-busting
      }
    }

    // 🔥 Guardar perfil + presencia
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        city: profile.city,
        province: profile.province,
        avatar_url,
        // presencia (se actualiza también desde SupabaseProvider)
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      alert("Error guardando perfil");
      return;
    }

    // 🔥 Actualizar el contexto global
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (updatedProfile) {
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: updatedProfile })
      );
    }

    alert("Perfil actualizado");
  }

  if (!user) {
    return (
      <p className="text-center text-zinc-400 mt-20 text-lg">
        Tenés que iniciar sesión para ver tu perfil.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-center text-zinc-400 mt-20 animate-pulse">
        Cargando perfil...
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
        <h1 className="text-5xl font-extrabold tracking-tight">Mi perfil</h1>
        <p className="text-zinc-400 text-lg">Editá tu información personal.</p>
      </div>

      {/* AVATAR */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border border-white/10 shadow-xl">
          {preview ? (
            <Image src={preview} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Camera size={32} />
            </div>
          )}
        </div>

        <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 transition px-4 py-2 rounded-xl text-sm text-zinc-300 border border-zinc-700">
          Cambiar foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setAvatarFile(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>

      {/* FORM */}
      <div className="space-y-6">
        <input
          placeholder="Nombre completo"
          value={profile.full_name}
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
        />

        <textarea
          placeholder="Bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white h-28 focus:border-blue-500 transition"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Ciudad"
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          />

          <input
            placeholder="Provincia"
            value={profile.province}
            onChange={(e) =>
              setProfile({ ...profile, province: e.target.value })
            }
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 transition"
          />
        </div>

        {/* EMAIL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 text-sm">
          Email: {user.email}
        </div>

        {/* MIS PRODUCTOS */}
        <Link
          href="/profile/my-products"
          className="block text-center bg-zinc-800 hover:bg-zinc-700 transition px-6 py-3 rounded-xl text-white font-medium border border-zinc-700"
        >
          Ver mis productos publicados
        </Link>

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
