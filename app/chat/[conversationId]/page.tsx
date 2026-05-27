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
    id: string;
    title: string;
    image_url: string | null;
  };
  otherUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    is_online: boolean;
    last_seen_at: string | null;
    is_typing: boolean;
  };
  is_archived: boolean;
  is_blocked: boolean;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;
  const { user, supabase } = useSupabase();

  const [info, setInfo] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const formatLastSeen = (iso: string | null) => {
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

  // Cargar info desde API
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);

      const res = await fetch(`/api/conversations/single?id=${conversationId}`);
      const data = await res.json();

      if (data?.id) {
        const isBuyer = data.buyer_id === user.id;

        setInfo({
          id: data.id,
          buyer_id: data.buyer_id,
          seller_id: data.seller_id,
          is_archived: data.is_archived ?? false,
          is_blocked: data.is_blocked ?? false,
          product: {
            id: data.product_id,
            title: data.product_title,
            image_url: data.product_image,
          },
          otherUser: {
            id: isBuyer ? data.seller_id : data.buyer_id,
            full_name: data.otherUser?.full_name ?? null,
            avatar_url: data.otherUser?.avatar_url ?? null,
            is_online: data.otherUser?.is_online ?? false,
            last_seen_at: data.otherUser?.last_seen_at ?? null,
            is_typing: data.otherUser?.is_typing ?? false,
          },
        });
      }

      setLoading(false);
    }

    load();
  }, [conversationId, user]);

  // Realtime presencia + typing
  useEffect(() => {
    if (!info?.otherUser?.id || !supabase) return;

    const channel = supabase
      .channel(`presence-${info.otherUser.id}`)
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
      supabase.removeChannel(channel);
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
      <motion.p className="text-center text-[var(--text-muted)] mt-20 text-lg">
        Tenés que iniciar sesión para ver esta conversación.
      </motion.p>
    );
  }

  if (loading || !info) {
    return (
      <p className="text-center text-[var(--text-muted)] mt-20 animate-pulse">
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
    <motion.div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div
        className="
          flex items-center gap-4 
          bg-[var(--surface)] border border-[var(--border)] 
          p-4 rounded-2xl shadow-sm
        "
      >
        {/* AVATAR */}
        <div
          className="
            relative w-14 h-14 rounded-full overflow-hidden 
            border border-[var(--border)] bg-[var(--surface-hover)]
          "
        >
          {info.otherUser.avatar_url ? (
            <Image
              src={info.otherUser.avatar_url}
              alt="Usuario"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              ?
            </div>
          )}
        </div>

        {/* USER INFO */}
        <div className="flex-1">
          <p className="text-[var(--text)] font-semibold text-lg">
            {info.otherUser.full_name ?? "Usuario"}
          </p>
          <p className="text-[var(--text-muted)] text-sm">{statusText}</p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={archiveConversation}
            className="
              p-2 rounded-lg bg-[var(--surface)] 
              border border-[var(--border)]
              hover:bg-[var(--surface-hover)] transition
            "
          >
            <Archive
              size={20}
              className={
                info.is_archived ? "text-yellow-400" : "text-[var(--text-muted)]"
              }
            />
          </button>

          <button
            onClick={blockConversation}
            className="
              p-2 rounded-lg bg-[var(--surface)] 
              border border-[var(--border)]
              hover:bg-[var(--surface-hover)] transition
            "
          >
            <Ban
              size={20}
              className={
                info.is_blocked ? "text-red-500" : "text-[var(--text-muted)]"
              }
            />
          </button>
        </div>

        {/* PRODUCT */}
        <Link
          href={`/products/${info.product.id}`}
          className="
            flex items-center gap-3 
            bg-[var(--surface-hover)] px-3 py-2 rounded-xl 
            border border-[var(--border)] hover:bg-[var(--surface)] transition ml-4
          "
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
            <div className="w-12 h-12 bg-[var(--surface)] rounded-lg" />
          )}

          <p className="text-sm text-[var(--text-muted)] max-w-[120px] truncate">
            {info.product.title}
          </p>
        </Link>
      </div>

      {/* CHAT */}
      <ChatWindow conversationId={conversationId} currentUserId={user.id} />
    </motion.div>
  );
}
