import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usamos service_role porque es backend
);

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

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/messages
export async function POST(req: Request) {
  const body = await req.json();
  const { conversationId, content } = body;

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // ⚠️ Más adelante reemplazamos "demo-user" por el usuario real
  const newMessage = {
    content,
    sender_id: "demo-user",
    conversation_id: conversationId,
  };

  const { data, error } = await supabase
    .from("messages")
    .insert(newMessage)
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
