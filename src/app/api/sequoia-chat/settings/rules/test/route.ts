import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { ruleTitle, ruleContent } = await req.json();
    if (!ruleTitle || !ruleContent) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ruleText = ruleTitle + ": " + ruleContent;

    // Step 1: Generate a realistic test question that DIRECTLY triggers this rule
    const qRes = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 60,
      system: "Eres un cliente colombiano escribiendo por WhatsApp a Sequoia Speed (tienda de chaquetas, pantalones e impermeables para moto).\n\nTu trabajo: generar UN mensaje corto de cliente que DIRECTAMENTE active esta regla del vendedor:\n\"" + ruleText + "\"\n\nEl mensaje debe ser una situacion realista donde el vendedor NECESITE aplicar esta regla.\nSolo escribe el mensaje del cliente, nada mas. Sin comillas. Maximo 1-2 lineas.",
      messages: [{ role: "user", content: "Genera el mensaje del cliente:" }],
    });

    const question = qRes.content[0].type === "text" ? qRes.content[0].text.trim() : "Hola";

    // Step 2: Generate AI response following the rule
    const aRes = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 100,
      system: "Eres Jorge Cardozo, asesor de ventas de Sequoia Speed (fabricante colombiano de chaquetas, pantalones e impermeables para moto).\n\nREGLA QUE DEBES SEGUIR OBLIGATORIAMENTE:\n" + ruleText + "\n\nResponde al mensaje del cliente aplicando esta regla. Responde corto, maximo 2-3 lineas, como vendedor real en WhatsApp colombiano. Sin signos de apertura de interrogacion. Usa \"senor\" o \"senora\".",
      messages: [{ role: "user", content: question }],
    });

    const answer = aRes.content[0].type === "text" ? aRes.content[0].text.trim() : "Sin respuesta";

    return NextResponse.json({ question, answer });
  } catch (e: any) {
    console.error("[Rule Test]", e?.message || e);
    return NextResponse.json({ error: "AI error: " + (e?.message || "unknown") }, { status: 500 });
  }
}
