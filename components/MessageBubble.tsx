"use client";

import { motion } from "framer-motion";

interface Props {
  content: string;
  isOwn: boolean;
  time: string;
  status?: "sent" | "delivered" | "seen";
}

export default function MessageBubble({ content, isOwn, time, status }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-xl border 
          shadow-sm text-sm leading-relaxed
          ${isOwn 
            ? "bg-[var(--accent)] text-white border-transparent" 
            : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
          }
        `}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        <div
          className={`
            flex items-center gap-1 mt-1 text-[10px]
            ${isOwn ? "text-white/80" : "text-[var(--text-muted)]"}
          `}
        >
          <span>{time}</span>

          {isOwn && status && (
            <span>
              {status === "sent" && "✓"}
              {status === "delivered" && "✓✓"}
              {status === "seen" && "✓✓"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
