import Link from "next/link";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Conversaciones</h1>

      <Link href="/chat/demo" className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-semibold">Macbook Pro</h2>
        <p className="text-zinc-400">Último mensaje...</p>
      </Link>
    </div>
  );
}