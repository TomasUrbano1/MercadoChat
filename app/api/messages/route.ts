import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // client backend con service_role

// 🔥 GET /api/messages?conversationId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  // 1️⃣ Obtener mensajes ordenados
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2️⃣ Marcar como vistos (seen_at) para el receptor
  // ⚠️ Esto se hace automáticamente cuando el usuario abre la conversación
  const { error: seenError } = await supabaseAdmin
    .from("messages")
    .update({ seen_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("seen_at", null);

  if (seenError) {
    console.error("Error updating seen_at:", seenError.message);
  }

  return NextResponse.json(data);
}

// 🔥 POST /api/messages
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, content, sender_id } = body;

    if (!conversationId || !content || !sender_id) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Crear mensaje nuevo
    const newMessage = {
      content,
      sender_id,
      conversation_id: conversationId,
      delivered_at: new Date().toISOString(), // 🔥 se marca como entregado al insertar
    };

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert(newMessage)
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2️⃣ Actualizar updated_at de la conversación
    const { error: convError } = await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (convError) {
      console.error("Error updating conversation timestamp:", convError.message);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Unexpected error:", err.message);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
