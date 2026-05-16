"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    await supabase.auth.signInWithPassword({ email, password });
    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Login</h1>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-600 w-full" onClick={handleLogin}>Ingresar</button>
    </div>
  );
}