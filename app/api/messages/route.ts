import { NextResponse } from "next/server";

const messages = [
  {
    id: "1",
    content: "Hola! Sigue disponible?",
    sender_id: "other-user",
  },
];

export async function GET() {
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    id: crypto.randomUUID(),
    sender_id: "demo-user",
    ...body,
  });
}