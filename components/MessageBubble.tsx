interface Props {
  content: string;
  isOwn: boolean;
}

export default function MessageBubble({ content, isOwn }: Props) {
  return (
    <div className={`max-w-xs p-3 rounded-2xl ${isOwn ? "bg-blue-600 ml-auto" : "bg-zinc-800"}`}>
      {content}
    </div>
  );
}