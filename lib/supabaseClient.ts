import { createClient } from "@supabase/supabase-js";

// 🔥 Configuración avanzada con Realtime habilitado
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // optimiza rendimiento
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// 🔄 Helper opcional para presencia global
export async function updatePresence(userId: string, online: boolean) {
  if (!userId) return;
  const now = new Date().toISOString();

  await supabase
    .from("profiles")
    .update({
      is_online: online,
      last_seen_at: now,
    })
    .eq("id", userId);
}
