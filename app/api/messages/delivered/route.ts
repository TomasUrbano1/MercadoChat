import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// POST /api/messages/delivered
export async function POST(req: Request) {
  const { messageId, userId } = await req.json();

  if (!messageId || !userId) {
    return NextResponse.json(
      { error: "Missing messageId or userId" },
      { status: 400 }
    );
  }

  // 1️⃣ Obtener mensaje
  const { data: msg, error: msgError } = await supabaseAdmin
    .from("messages")
    .select("id, conversation_id, sender_id")
    .eq("id", messageId)
    .single();

  if (msgError || !msg) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // 2️⃣ Validar que el usuario NO sea el que envió el mensaje
  if (msg.sender_id === userId) {
    return NextResponse.json({ success: true }); // nada que hacer
  }

  // 3️⃣ Marcar como entregado
  await supabaseAdmin
    .from("messages")
    .update({ delivered_at: new Date().toISOString() })
    .eq("id", messageId)
    .is("delivered_at", null);

  return NextResponse.json({ success: true });
}
