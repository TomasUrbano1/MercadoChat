import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/messages?conversationId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Unexpected GET error:", err.message);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

// POST /api/messages
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

    // 1️⃣ Validar que el usuario pertenece a la conversación
    const { data: conv, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("buyer_id, seller_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant =
      conv.buyer_id === sender_id || conv.seller_id === sender_id;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 2️⃣ Crear mensaje nuevo
    const newMessage = {
      content,
      sender_id,
      conversation_id: conversationId,
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

    // 3️⃣ Actualizar updated_at de la conversación
    await supabaseAdmin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Unexpected POST error:", err.message);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
