"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useSupabase } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

type Conversation = {
  id: string;
  product_title: string;
  product_image?: string | null;
  last_message: string;
  updated_at: string;
  last_message_sender?: string;
  last_message_seen_at?: string | null;
  last_message_delivered_at?: string | null;
};

// 🔧 Tipo para mensajes realtime
type MessagePayload = {
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  seen_at?: string | null;
  delivered_at?: string | null;
};

export default function ChatPage() {
  const { user } = useSupabase();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;

  // 🔥 Cargar conversaciones iniciales
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

  // 🔥 Realtime estable (sin loops)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const msg = payload.new as MessagePayload;

          const current = conversationsRef.current;
          const exists = current.find((c) => c.id === msg.conversation_id);

          // 1️⃣ Si no existe → recargar lista completa
          if (!exists) {
            const res = await fetch(`/api/conversations?user_id=${user.id}`);
            const data = await res.json();
            setConversations(data);
            return;
          }

          // 2️⃣ Si existe → actualizar last_message + updated_at + estado
          const updated = current.map((c) =>
            c.id === msg.conversation_id
              ? {
                  ...c,
                  last_message: msg.content,
                  updated_at: msg.created_at,
                  last_message_sender: msg.sender_id,
                  last_message_seen_at: msg.seen_at,
                  last_message_delivered_at: msg.delivered_at,
                }
              : c
          );

          // 3️⃣ Reordenar (solo si el mensaje es del otro usuario)
          if (msg.sender_id !== user.id) {
            updated.sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );
          }

          setConversations(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 🔥 Determinar estado visual del último mensaje
  const getStatusIcon = (conv: Conversation) => {
    if (conv.last_message_sender !== user?.id) return null; // solo mostrar en mensajes propios

    if (conv.last_message_seen_at)
      return <span className="text-blue-400 font-semibold">✓✓</span>;
    if (conv.last_message_delivered_at)
      return <span className="text-zinc-300 font-semibold">✓✓</span>;
    return <span className="text-zinc-500 font-semibold">✓</span>;
  };

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

      {/* LISTA */}
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
                    <p className="text-zinc-400 text-sm mt-1 flex items-center gap-1">
                      {getStatusIcon(conv)}
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

      {/* VACÍO */}
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
