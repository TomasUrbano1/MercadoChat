import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ← usamos el client del backend

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
    console.error(error);
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
  const body = await req.json();
  const { buyer_id, seller_id, product_id } = body;

  if (!buyer_id || !seller_id || !product_id) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
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
