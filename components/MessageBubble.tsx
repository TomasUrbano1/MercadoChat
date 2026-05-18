"use client";

import { motion } from "framer-motion";

interface Props {
  content: string;
  isOwn: boolean;
  time?: string;
  status?: "sent" | "delivered" | "seen";
}

export default function MessageBubble({ content, isOwn, time, status }: Props) {
  // 🔥 Determinar color del estado
  const statusColor =
    status === "seen"
      ? "text-blue-400"
      : status === "delivered"
      ? "text-zinc-300"
      : "text-zinc-500";

  // 🔥 Determinar ícono del estado
  const statusIcon =
    status === "sent"
      ? "✓"
      : status === "delivered"
      ? "✓✓"
      : status === "seen"
      ? "✓✓"
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-end gap-2 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* AVATAR DEL OTRO USUARIO */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white font-semibold">
          U
        </div>
      )}

      {/* BURBUJA */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md relative
        ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-zinc-800 text-zinc-200 rounded-bl-none"
        }`}
      >
        {/* CONTENIDO */}
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {/* TIME + STATUS */}
        {(time || status) && (
          <div
            className={`flex items-center gap-1 mt-1 text-[10px] opacity-70 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            {time && <span>{time}</span>}

            {/* STATUS (solo para mensajes propios) */}
            {isOwn && status && (
              <span className={`${statusColor} font-semibold`}>
                {statusIcon}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ESPACIO PARA ALINEAR AVATAR DEL OTRO LADO */}
      {isOwn && <div className="w-8" />}
    </motion.div>
  );
}
