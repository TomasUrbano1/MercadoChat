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
  const [otherTyping, setOtherTyping] = useState(false);

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

      // marcar como visto
      await fetch("/api/messages/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          userId: currentUserId,
        }),
      });
    }

    loadMessages();
  }, [conversationId, currentUserId]);

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

          if (payload.eventType === "INSERT") {
            if (!messagesRef.current.some((m) => m.id === msg.id)) {
              setMessages((prev) => [...prev, msg]);
              setTimeout(scrollToBottom, 50);

              if (msg.sender_id !== currentUserId) {
                fetch("/api/messages/delivered", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messageId: msg.id,
                    userId: currentUserId,
                  }),
                });
              }
            }
          }

          if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) => (m.id === msg.id ? msg : m))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Typing realtime
  useEffect(() => {
    const channel = supabase.channel(`typing-${conversationId}`);

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.sender !== currentUserId) {
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 1500);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Enviar mensaje
  async function sendMessage() {
    if (!content.trim() || sending) return;

    const tempId = `temp-${Date.now()}`;

    const optimistic: Message = {
      id: tempId,
      content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    const toSend = content;
    setContent("");
    setSending(true);

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        content: toSend,
        sender_id: currentUserId,
      }),
    });

    setSending(false);
  }

  // Emit typing event
  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value);

    supabase.channel(`typing-${conversationId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { sender: currentUserId },
    });
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
    <div
      className="
        flex flex-col h-[80vh] rounded-2xl overflow-hidden 
        bg-[var(--surface)] border border-[var(--border)] shadow-lg
      "
    >
      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <p className="text-[var(--text-muted)] text-center">
            Cargando mensajes...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-[var(--text-muted)] text-center">
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

        {otherTyping && (
          <div className="text-[var(--text-muted)] text-sm italic px-2">
            El otro usuario está escribiendo…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-soft)]">
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
            className="
              flex-1 px-4 py-3 rounded-xl text-sm
              bg-[var(--surface)] border border-[var(--border)]
              text-[var(--text)] placeholder-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
            "
            disabled={sending}
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className="
              px-4 py-3 rounded-xl flex items-center gap-2
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              text-white transition disabled:opacity-50
            "
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
