import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ← client backend seguro

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, price, category, image_url, seller_id } = body;

  // Validación PRO
  if (!title || !price || !category || !seller_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Insertar producto real
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      title,
      description,
      price,
      category,
      image_url,
      seller_id,
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
    product: data,
  });
}
