"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  content: string;
  sender_id: string;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then(setMessages);

    const channel = supabase
      .channel("messages")
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage() {
    if (!content.trim()) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content }),
    });

    setContent("");
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={msg.sender_id === currentUserId}
          />
        ))}
      </div>

      <div className="border-t border-zinc-800 p-4 flex gap-2">
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribí un mensaje..." />
        <button onClick={sendMessage} className="bg-blue-600">Enviar</button>
      </div>
    </div>
  );
}