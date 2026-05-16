"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { user } = useSupabase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/60 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO + BRAND */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-mercadochat.png"
            alt="MercadoChat logo"
            width={36}
            height={36}
            className="rounded-md transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            MercadoChat
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm transition ${
                  active
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}

                {/* Indicador activo */}
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}

          {/* CTA PUBLICAR */}
          <Link
            href="/products/new"
            className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg shadow-blue-600/20"
          >
            Publicar
          </Link>

          {/* AUTH */}
          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-zinc-400 hover:text-white transition"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg shadow-blue-600/20"
              >
                Crear cuenta
              </Link>
            </div>
          ) : (
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer">
                {user.email?.[0]?.toUpperCase()}
              </div>

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-3 w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 rounded-t-xl"
                >
                  Mi perfil
                </Link>

                <Link
                  href="/chat"
                  className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Conversaciones
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-b-xl"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-zinc-300"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-4"
          >
            {links.map(({ href, label }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block text-sm py-2 ${
                    active
                      ? "text-white font-medium"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            <Link
              href="/products/new"
              onClick={() => setOpen(false)}
              className="block bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white text-center text-sm font-medium shadow-lg shadow-blue-600/20"
            >
              Publicar producto
            </Link>

            {/* AUTH MOBILE */}
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="text-zinc-400 hover:text-white transition block"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white text-center text-sm font-medium shadow-lg shadow-blue-600/20 block"
                >
                  Crear cuenta
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-zinc-400 hover:text-white transition block"
                >
                  Mi perfil
                </Link>

                <Link
                  href="/chat"
                  onClick={() => setOpen(false)}
                  className="text-zinc-400 hover:text-white transition block"
                >
                  Conversaciones
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="text-red-400 hover:text-red-300 transition text-left block"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
