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
      products ( title, image_url ),
      messages ( content, created_at )
    `
    )
    .or(`buyer_id.eq.${user_id},seller_id.eq.${user_id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data.map((conv) => {
    const product = conv.products?.[0];
    const lastMessage = conv.messages?.[conv.messages.length - 1];

    return {
      id: conv.id,
      product_title: product?.title ?? "Producto",
      product_image: product?.image_url ?? null,
      last_message: lastMessage?.content ?? "",
      updated_at: lastMessage?.created_at ?? conv.created_at,
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

    // 1️⃣ Buscar conversación existente entre buyer + seller + producto
    const { data: existing, error: searchError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("buyer_id", buyer_id)
      .eq("seller_id", seller_id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (searchError) {
      console.error("Error buscando conversación:", searchError.message);
    }

    // Si ya existe → devolverla
    if (existing) {
      return NextResponse.json({
        success: true,
        conversation: existing,
        existed: true,
      });
    }

    // 2️⃣ Crear conversación nueva
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .insert([{ buyer_id, seller_id, product_id }])
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
