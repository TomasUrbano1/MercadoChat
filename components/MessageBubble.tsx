"use client";

interface Props {
  content: string;
  isOwn: boolean;
  time?: string;
}

export default function MessageBubble({ content, isOwn, time }: Props) {
  return (
    <div
      className={`flex w-full items-end gap-2 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* AVATAR */}
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
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {time && (
          <span
            className={`block text-[10px] opacity-70 mt-1 ${
              isOwn ? "text-right" : "text-left"
            }`}
          >
            {time}
          </span>
        )}
      </div>

      {/* ESPACIO PARA ALINEAR AVATAR DEL OTRO LADO */}
      {isOwn && <div className="w-8" />}
    </div>
  );
}
