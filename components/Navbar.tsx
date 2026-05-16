"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 p-4 flex justify-between">
      <Link href="/" className="font-bold text-xl">MercadoChat</Link>
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/products">Productos</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/auth/login">Login</Link>
      </div>
    </nav>
  );
}