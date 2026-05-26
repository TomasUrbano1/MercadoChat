// GET /api/conversations/single?id=xxxx
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
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

      products:products!conversations_product_id_fkey (
        id,
        title,
        image_url
      ),

      last_message:messages!messages_conversation_id_fkey (
        id,
        content,
        created_at,
        sender_id,
        delivered_at,
        seen_at
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const product = Array.isArray(data.products)
    ? data.products[0]
    : data.products;

  const last = Array.isArray(data.last_message)
    ? data.last_message.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0]
    : null;

  return NextResponse.json({
    id: data.id,
    product_title: product?.title ?? "Producto",
    product_image: product?.image_url ?? null,
    last_message: last?.content ?? "",
    last_message_sender: last?.sender_id ?? null,
    last_message_seen_at: last?.seen_at ?? null,
    last_message_delivered_at: last?.delivered_at ?? null,
    updated_at: last?.created_at ?? data.updated_at ?? data.created_at,
  });
}
