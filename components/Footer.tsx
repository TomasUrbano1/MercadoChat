"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10 bg-zinc-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-12 text-sm">
        
        {/* BRAND */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mercadochat.png"
              alt="MercadoChat logo"
              width={40}
              height={40}
              className="rounded-md opacity-90"
            />
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              MercadoChat
            </h2>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            El marketplace moderno donde comprar y vender se siente tan simple
            como chatear.
          </p>
        </div>

        {/* LINKS */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Navegación</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className="text-zinc-400 hover:text-white transition"
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="/products"
                className="text-zinc-400 hover:text-white transition"
              >
                Productos
              </a>
            </li>
            <li>
              <a
                href="/chat"
                className="text-zinc-400 hover:text-white transition"
              >
                Chat
              </a>
            </li>
            <li>
              <a
                href="/products/new"
                className="text-zinc-400 hover:text-white transition"
              >
                Publicar producto
              </a>
            </li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Conectá</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/"
                target="_blank"
                className="text-zinc-400 hover:text-white transition"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/"
                target="_blank"
                className="text-zinc-400 hover:text-white transition"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@example.com"
                className="text-zinc-400 hover:text-white transition"
              >
                Email
              </a>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition"
              >
                Términos y condiciones
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition"
              >
                Política de privacidad
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-white/10 py-6 text-center text-zinc-500 text-xs">
        © 2026 MercadoChat — Construido con pasión desde Argentina
      </div>
    </footer>
  );
}
