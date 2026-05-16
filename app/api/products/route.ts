import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend seguro
);

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
  const { data, error } = await supabase
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
