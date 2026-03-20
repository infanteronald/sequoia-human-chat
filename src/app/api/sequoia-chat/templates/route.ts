import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WABA_ID = process.env.WHATSAPP_WABA_ID;

export async function GET() {
  if (!ACCESS_TOKEN || !WABA_ID) {
    return NextResponse.json({ error: "WHATSAPP_ACCESS_TOKEN or WHATSAPP_WABA_ID not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?fields=name,status,language,components,category&limit=100`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }, next: { revalidate: 60 } }
    );
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    // Only return APPROVED templates, exclude hello_world
    const templates = (data.data || [])
      .filter((t: any) => t.status === "APPROVED" && t.name !== "hello_world")
      .map((t: any) => ({
        id: t.id || t.name,
        template_id: t.id,
        name: t.name,
        category: t.category,
        language: t.language,
        status: t.status,
        components: t.components,
      }));

    return NextResponse.json(templates);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
