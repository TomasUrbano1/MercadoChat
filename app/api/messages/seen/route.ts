import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// POST /api/messages/seen
export async function POST(req: Request) {
  const { conversationId, userId } = await req.json();

  if (!conversationId || !userId) {
    return NextResponse.json(
      { error: "Missing conversationId or userId" },
      { status: 400 }
    );
  }

  // 1️⃣ Validar que el usuario pertenece a la conversación
  const { data: conv, error: convError } = await supabaseAdmin
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if (convError || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const isParticipant =
    conv.buyer_id === userId || conv.seller_id === userId;

  if (!isParticipant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 2️⃣ Marcar como visto (solo mensajes del otro usuario)
  await supabaseAdmin
    .from("messages")
    .update({ seen_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("seen_at", null);

  return NextResponse.json({ success: true });
}
