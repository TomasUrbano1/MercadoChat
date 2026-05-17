"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister() {
    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo crear la cuenta");
      return;
    }

    setSuccess("Cuenta creada. Revisá tu email para confirmar.");
    setTimeout(() => router.push("/auth/login"), 1500);
  }

  return (
    <motion.div
      className="max-w-md mx-auto mt-24 bg-zinc-900 border border-zinc-800 p-10 rounded-2xl space-y-8 shadow-2xl shadow-black/40"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Crear cuenta</h1>
        <p className="text-zinc-400 text-sm">
          Unite a MercadoChat y empezá a publicar.
        </p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-center bg-red-400/10 p-2 rounded-lg border border-red-400/20"
        >
          {error}
        </motion.p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 text-center bg-green-400/10 p-2 rounded-lg border border-green-400/20"
        >
          {success}
        </motion.p>
      )}

      <div className="space-y-5">
        <input
          type="email"
          placeholder="Email"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          Crear cuenta
        </button>
      </div>

      <p className="text-center text-zinc-400 text-sm">
        ¿Ya tenés cuenta?{" "}
        <a href="/auth/login" className="text-blue-400 hover:underline">
          Ingresar
        </a>
      </p>
    </motion.div>
  );
}
