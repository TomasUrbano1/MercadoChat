import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend seguro
);

// GET /api/conversations
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }

  // Buscar conversaciones donde el usuario sea buyer o seller
  const { data, error } = await supabase
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
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Procesar último mensaje
  const formatted = data.map((conv) => ({
    id: conv.id,
    product_title: conv.products?.[0]?.title ?? "Producto",
    product_image: conv.products?.[0]?.image_url ?? null,
    last_message: conv.messages?.[conv.messages.length - 1]?.content ?? "",
    updated_at:
      conv.messages?.[conv.messages.length - 1]?.created_at ??
      conv.created_at,
  }));

  return NextResponse.json(formatted);
}

// POST /api/conversations
export async function POST(req: Request) {
  const body = await req.json();
  const { buyer_id, seller_id, product_id } = body;

  if (!buyer_id || !seller_id || !product_id) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // Crear conversación
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id,
      seller_id,
      product_id,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    conversation: data,
  });
}
