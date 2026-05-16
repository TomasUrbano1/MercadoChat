"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useSupabase } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";

type Conversation = {
  id: string;
  product_title: string;
  product_image?: string | null;
  last_message: string;
  updated_at: string;
};

export default function ChatPage() {
  const { user } = useSupabase();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      const res = await fetch(`/api/conversations?user_id=${user.id}`);
      const data = await res.json();
      setConversations(data);
      setLoading(false);
    }

    load();
  }, [user]);

  if (!user) {
    return (
      <motion.p
        className="text-center text-zinc-400 mt-20 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tenés que iniciar sesión para ver tus conversaciones.
      </motion.p>
    );
  }

  return (
    <motion.div
      className="space-y-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <header className="text-center space-y-3">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Conversaciones
        </h1>
        <p className="text-zinc-400 text-lg">
          Chateá con compradores y vendedores en tiempo real.
        </p>
      </header>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-zinc-500 text-lg animate-pulse">
          Cargando conversaciones...
        </p>
      )}

      {/* LISTA DE CONVERSACIONES */}
      {!loading && conversations.length > 0 && (
        <section className="space-y-4">
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/chat/${conv.id}`}
                className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-xl">
                      {conv.product_title}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      {conv.last_message || "Sin mensajes aún"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-blue-400">
                    <MessageCircle size={22} />
                    <span className="text-sm">
                      {new Date(conv.updated_at).toLocaleString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>
      )}

      {/* SI NO HAY CONVERSACIONES */}
      {!loading && conversations.length === 0 && (
        <motion.p
          className="text-zinc-500 text-center text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Todavía no tenés conversaciones.
        </motion.p>
      )}
    </motion.div>
  );
}
