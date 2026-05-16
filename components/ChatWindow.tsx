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

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar historial + realtime
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

    // Realtime
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Enviar mensaje
  async function sendMessage() {
    if (!content.trim()) return;

    const newMessage = {
      conversationId,
      content,
    };

    setContent("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });
  }

  // Formatear fecha
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-white/10 p-4 bg-zinc-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-500 transition px-4 py-3 rounded-xl text-white flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
