"use client";

import ChatWindow from "@/components/ChatWindow";
import { useSupabase } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Archive, Ban } from "lucide-react";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

interface ConversationInfo {
  id: string;
  buyer_id: string;
  seller_id: string;
  product: {
    title: string;
    image_url: string | null;
    id?: string;
  };
  otherUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_online?: boolean;
    last_seen_at?: string | null;
    is_typing?: boolean;
  };
  is_archived?: boolean;
  is_blocked?: boolean;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;
  const { user, supabase } = useSupabase();

  const [info, setInfo] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const formatLastSeen = (iso: string | null | undefined) => {
    if (!iso) return "Desconectado";

    const date = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return "Activo hace un momento";
    if (diff < 3600) return `Activo hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Activo hace ${Math.floor(diff / 3600)} h`;

    return `Visto el ${date.toLocaleDateString("es-AR")} a las ${date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Cargar info de la conversación
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          buyer_id,
          seller_id,
          is_archived,
          is_blocked,
          products:products!conversations_product_id_fkey ( id, title, image_url ),
          buyer:profiles!conversations_buyer_id_fkey ( id, full_name, avatar_url, is_online, last_seen_at, is_typing ),
          seller:profiles!conversations_seller_id_fkey ( id, full_name, avatar_url, is_online, last_seen_at, is_typing )
        `
        )
        .eq("id", conversationId)
        .single();

      if (!error && data) {
        const isBuyer = data.buyer_id === user.id;

        const productData = Array.isArray(data.products)
          ? data.products[0]
          : data.products;

        const otherUserData = isBuyer ? data.seller : data.buyer;
        const otherUser = Array.isArray(otherUserData)
          ? otherUserData[0]
          : otherUserData;

        setInfo({
          id: data.id,
          buyer_id: data.buyer_id,
          seller_id: data.seller_id,
          is_archived: data.is_archived,
          is_blocked: data.is_blocked,
          product: {
            id: productData?.id,
            title: productData?.title ?? "Producto",
            image_url: productData?.image_url ?? null,
          },
          otherUser: {
            id: otherUser?.id ?? "",
            full_name: otherUser?.full_name ?? null,
            avatar_url: otherUser?.avatar_url ?? null,
            is_online: otherUser?.is_online ?? false,
            last_seen_at: otherUser?.last_seen_at ?? null,
            is_typing: otherUser?.is_typing ?? false,
          },
        });
      }

      setLoading(false);
    }

    load();
  }, [conversationId, user, supabase]);

  // Realtime: presencia + typing (FIX aplicado)
  useEffect(() => {
    if (!info?.otherUser?.id || !supabase) return;

    // 🔥 FIX: cambiar nombre del canal para evitar hidratación automática
    const channel = supabase.channel(`presence-user-${info.otherUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${info.otherUser.id}`,
        },
        (payload) => {
          const updated = payload.new;

          setInfo((prev) =>
            prev
              ? {
                  ...prev,
                  otherUser: {
                    ...prev.otherUser,
                    is_online: updated.is_online,
                    last_seen_at: updated.last_seen_at,
                    is_typing: updated.is_typing,
                  },
                }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [info?.otherUser?.id, supabase]);

  async function archiveConversation() {
    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        archived: !info?.is_archived,
      }),
    });

    setInfo((prev) =>
      prev ? { ...prev, is_archived: !prev.is_archived } : prev
    );
  }

  async function blockConversation() {
    await fetch("/api/conversations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        blocked: !info?.is_blocked,
      }),
    });

    setInfo((prev) =>
      prev ? { ...prev, is_blocked: !prev.is_blocked } : prev
    );
  }

  if (!user) {
    return (
      <motion.p
        className="text-center text-zinc-400 mt-20 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tenés que iniciar sesión para ver esta conversación.
      </motion.p>
    );
  }

  if (loading || !info) {
    return (
      <p className="text-center text-zinc-400 mt-20 animate-pulse">
        Cargando conversación...
      </p>
    );
  }

  const statusText = info.otherUser.is_typing
    ? "Escribiendo…"
    : info.otherUser.is_online
    ? "Conectado"
    : formatLastSeen(info.otherUser.last_seen_at);

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 bg-zinc-900/60 border border-white/10 p-4 rounded-2xl backdrop-blur-xl relative">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10">
          {info.otherUser.avatar_url ? (
            <Image
              src={info.otherUser.avatar_url}
              alt="Usuario"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-zinc-800 text-zinc-500">
              ?
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold text-lg">
            {info.otherUser.full_name ?? "Usuario"}
          </p>
          <p className="text-zinc-400 text-sm">{statusText}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={archiveConversation}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition"
            title="Archivar conversación"
          >
            <Archive
              size={20}
              className={info.is_archived ? "text-yellow-400" : "text-zinc-300"}
            />
          </button>

          <button
            onClick={blockConversation}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 transition"
            title="Bloquear usuario"
          >
            <Ban
              size={20}
              className={info.is_blocked ? "text-red-500" : "text-zinc-300"}
            />
          </button>
        </div>

        <Link
          href={`/products/${info.product.id}`}
          className="flex items-center gap-3 bg-zinc-800/50 px-3 py-2 rounded-xl border border-white/10 hover:bg-zinc-800 transition ml-4"
        >
          {info.product.image_url ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={info.product.image_url}
                alt="Producto"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-zinc-800 rounded-lg" />
          )}

          <p className="text-sm text-zinc-300 max-w-[120px] truncate">
            {info.product.title}
          </p>
        </Link>
      </div>

      <ChatWindow conversationId={conversationId} currentUserId={user.id} />
    </motion.div>
  );
}
