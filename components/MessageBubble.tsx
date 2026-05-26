"use client";

import { motion } from "framer-motion";

interface Props {
  content: string;
  isOwn: boolean;
  time?: string;
  status?: "sent" | "delivered" | "seen";
  avatarUrl?: string | null; // opcional
}

export default function MessageBubble({
  content,
  isOwn,
  time,
  status,
  avatarUrl,
}: Props) {
  const statusColor =
    status === "seen"
      ? "text-blue-400"
      : status === "delivered"
      ? "text-zinc-300"
      : "text-zinc-500";

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
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex w-full items-end gap-2 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* AVATAR DEL OTRO USUARIO */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-xs text-white font-semibold">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            "U"
          )}
        </div>
      )}

      {/* BURBUJA */}
      <div
        className={`max-w-[75%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md relative break-words whitespace-pre-wrap
        ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-zinc-800 text-zinc-200 rounded-bl-none"
        }`}
      >
        <p>{content}</p>

        {(time || status) && (
          <div
            className={`flex items-center gap-1 mt-1 text-[10px] opacity-70 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            {time && <span>{time}</span>}

            {isOwn && status && (
              <span className={`${statusColor} font-semibold`}>
                {statusIcon}
              </span>
            )}
          </div>
        )}
      </div>

      {isOwn && <div className="w-8" />}
    </motion.div>
  );
}
