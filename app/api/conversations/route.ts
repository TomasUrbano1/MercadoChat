import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/conversations
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(
      `
      id,
      buyer_id,
      seller_id,
      product_id,
      created_at,
      updated_at,
      is_archived,
      is_blocked,
      products:products!conversations_product_id_fkey ( title, image_url ),
      messages ( content, created_at, sender_id, delivered_at, seen_at )
    `
    )
    .or(`buyer_id.eq.${user_id},seller_id.eq.${user_id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data
    .filter((conv) => !conv.is_archived) // 🔥 ocultar archivadas
    .map((conv) => {
      const productData = Array.isArray(conv.products)
        ? conv.products[0]
        : conv.products;

      const lastMessage = conv.messages?.length
        ? conv.messages.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]
        : null;

      return {
        id: conv.id,
        product_title: productData?.title ?? "Producto",
        product_image: productData?.image_url ?? null,
        last_message: lastMessage?.content ?? "",
        last_message_sender: lastMessage?.sender_id ?? null,
        last_message_seen_at: lastMessage?.seen_at ?? null,
        last_message_delivered_at: lastMessage?.delivered_at ?? null,
        updated_at:
          lastMessage?.created_at ??
          conv.updated_at ??
          conv.created_at,
      };
    });

  return NextResponse.json(formatted);
}

// POST /api/conversations
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buyer_id, seller_id, product_id } = body;

    if (!buyer_id || !seller_id || !product_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1️⃣ Buscar conversación existente
    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("buyer_id", buyer_id)
      .eq("seller_id", seller_id)
      .eq("product_id", product_id)
      .maybeSingle();

    // 2️⃣ Si existe → actualizar updated_at
    if (existing) {
      const { data: updated } = await supabaseAdmin
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), is_archived: false })
        .eq("id", existing.id)
        .select()
        .single();

      return NextResponse.json({
        success: true,
        conversation: updated,
        existed: true,
      });
    }

    // 3️⃣ Crear conversación nueva
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .insert([
        {
          buyer_id,
          seller_id,
          product_id,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creando conversación:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversation: data,
      existed: false,
    });
  } catch (err: any) {
    console.error("Error inesperado creando conversación:", err.message);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// PATCH /api/conversations/archive
export async function PATCH(req: Request) {
  const { conversation_id, archived } = await req.json();

  if (!conversation_id) {
    return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ is_archived: archived })
    .eq("id", conversation_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/conversations/block
export async function PUT(req: Request) {
  const { conversation_id, blocked } = await req.json();

  if (!conversation_id) {
    return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ is_blocked: blocked })
    .eq("id", conversation_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
