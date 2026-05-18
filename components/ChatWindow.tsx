"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageBubble from "./MessageBubble";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  delivered_at?: string | null;
  seen_at?: string | null;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar historial
  useEffect(() => {
    async function loadMessages() {
      setLoading(true);

      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();

      setMessages(data);
      setLoading(false);

      setTimeout(scrollToBottom, 80);
    }

    loadMessages();
  }, [conversationId]);

  // Realtime mensajes
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;

          setMessages((prev) => {
            const exists = prev.find((m) => m.id === msg.id);

            if (payload.eventType === "INSERT" && !exists) {
              return [...prev, msg];
            }

            if (payload.eventType === "UPDATE" && exists) {
              return prev.map((m) => (m.id === msg.id ? msg : m));
            }

            return prev;
          });

          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Enviar mensaje
  async function sendMessage() {
    if (!content.trim() || sending) return;

    setSending(true);

    const newMessage = {
      conversationId,
      content,
      sender_id: currentUserId,
    };

    setContent("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });

    setSending(false);
  }

  // Typing realtime
  async function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value);

    if (!typing) {
      setTyping(true);

      await supabase
        .from("profiles")
        .update({ is_typing: true })
        .eq("id", currentUserId);

      setTimeout(async () => {
        setTyping(false);
        await supabase
          .from("profiles")
          .update({ is_typing: false })
          .eq("id", currentUserId);
      }, 1500);
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (msg: Message): "sent" | "delivered" | "seen" => {
    if (msg.seen_at) return "seen";
    if (msg.delivered_at) return "delivered";
    return "sent";
  };

  return (
    <div className="flex flex-col h-[80vh] border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/40 backdrop-blur-xl">
      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <p className="text-zinc-500 text-center">Cargando mensajes...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-zinc-500 text-center">
            Todavía no hay mensajes. Iniciá la conversación.
          </p>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={msg.sender_id === currentUserId}
            time={formatTime(msg.created_at)}
            status={msg.sender_id === currentUserId ? getStatus(msg) : undefined}
          />
        ))}

        {typing && (
          <div className="text-zinc-500 text-sm italic px-2">
            El otro usuario está escribiendo…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-white/10 p-4 bg-zinc-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <input
            value={content}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            disabled={sending}
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
