"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { user, profile } = useSupabase();

  // -------------------------------
  // 🔥 UNREAD MESSAGES
  // -------------------------------
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function loadUnread() {
      const { data } = await supabase
        .from("messages")
        .select("id")
        .is("seen_at", null)
        .neq("sender_id", user.id);

      setUnreadCount(data?.length ?? 0);
    }

    loadUnread();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("navbar-unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // -------------------------------
  // 🔥 THEME SYSTEM
  // -------------------------------
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.classList.toggle("light", saved === "light");
      return;
    }

    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = prefersLight ? "light" : "dark";

    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  // -------------------------------
  // 🔥 LOGOUT
  // -------------------------------
  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  // -------------------------------
  // 🔥 CLOSE MENU ON OUTSIDE CLICK
  // -------------------------------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-soft)]/70 border-b border-[var(--border)] transition-colors">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
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
                    ? "text-[var(--text)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <div className="flex items-center gap-1">
                  {label}

                  {href === "/chat" && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded-full"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>

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

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition"
          >
            {theme === "light" ? (
              <Moon size={18} className="text-zinc-700" />
            ) : (
              <Sun size={18} className="text-yellow-300" />
            )}
          </button>

          {/* AUTH */}
          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition"
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer overflow-hidden relative"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  user.email?.[0]?.toUpperCase()
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mi perfil
                    </Link>

                    <Link
                      href="/chat"
                      className="block px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Conversaciones
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10"
                    >
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-[var(--text-muted)]"
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
            className="md:hidden bg-[var(--bg-soft)]/90 backdrop-blur-xl border-t border-[var(--border)] px-6 py-4 space-y-4"
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
                      ? "text-[var(--text)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {label}

                    {href === "/chat" && unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* PUBLICAR */}
            <Link
              href="/products/new"
              onClick={() => setOpen(false)}
              className="block bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white text-center text-sm font-medium shadow-lg shadow-blue-600/20"
            >
              Publicar producto
            </Link>

            {/* THEME TOGGLE MOBILE */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition text-sm"
            >
              {theme === "light" ? (
                <>
                  <Moon size={18} /> Activar modo oscuro
                </>
              ) : (
                <>
                  <Sun size={18} /> Activar modo claro
                </>
              )}
            </button>

            {/* AUTH MOBILE */}
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] transition block"
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
                  className="text-[var(--text-muted)] hover:text-[var(--text)] transition block"
                >
                  Mi perfil
                </Link>

                <Link
                  href="/chat"
                  onClick={() => setOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text)] transition block flex items-center gap-2"
                >
                  Conversaciones
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-[2px] rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={async () => {
                    await handleLogout();
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
