"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SupabaseContextType {
  supabase: typeof supabase;
  user: any;
  profile: any;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Obtener sesión inicial
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cargar perfil desde la tabla "profiles"
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
    }

    loadProfile();
  }, [user]);

  // 🔄 Escuchar actualizaciones del perfil (cuando se guarda en ProfilePage)
  useEffect(() => {
    function handleProfileUpdate(e: any) {
      setProfile(e.detail); // actualiza el contexto global
    }

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, user, profile }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Hook para usar Supabase en cualquier componente
export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase debe usarse dentro de <SupabaseProvider>");
  }
  return ctx;
}
