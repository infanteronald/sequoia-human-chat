import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import pool from "@/lib/sequoia-chat-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const entries = formData.getAll("files");
    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    // Create date folder
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const uploadDir = path.join(process.cwd(), "public", "uploads", "guias", today);
    await mkdir(uploadDir, { recursive: true });

    const results = [];

    for (const entry of entries) {
      if (!(entry instanceof File)) continue;
      const file = entry as File;
      if (!file.name || file.size === 0) continue;

      // Save file
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      const url = `/uploads/guias/${today}/${filename}`;

      // Detect MIME type
      const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", heic: "image/heic" };
      const mediaType = mimeMap[ext] || "image/jpeg";

      // Step 1: Extract info with Claude Vision
      let extracted: any = {};
      try {
        const visionRes = await anthropic.messages.create({
          model: "claude-haiku-4-5",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType as any, data: buffer.toString("base64") },
              },
              {
                type: "text",
                text: `Analiza esta guia de envio/etiqueta de paquete. Extrae EXACTAMENTE estos datos en formato JSON:
{"nombre": "nombre completo del destinatario", "telefono": "numero de telefono (solo digitos)", "direccion": "direccion completa de envio", "ciudad": "ciudad de destino", "numeroGuia": "numero de guia o tracking"}
Si algun dato no es visible, usa null. Solo responde con el JSON, nada mas.`,
              },
            ],
          }],
        });

        const text = visionRes.content[0].type === "text" ? visionRes.content[0].text : "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("[Guia Vision]", e);
      }

      // Step 2: Match in database
      let match: any = { found: false, confidence: "ninguno" };

      // 2a. Match by phone number
      if (extracted.telefono) {
        const cleanPhone = extracted.telefono.replace(/\D/g, "");
        // Try different phone formats
        const phoneVariants = [cleanPhone];
        if (cleanPhone.length === 10) phoneVariants.push("57" + cleanPhone); // Add country code
        if (cleanPhone.startsWith("57") && cleanPhone.length === 12) phoneVariants.push(cleanPhone.slice(2)); // Remove country code

        for (const phone of phoneVariants) {
          const phoneRes = await pool.query(
            "SELECT session_id, nombre, telefono FROM contacts WHERE session_id LIKE $1 OR telefono LIKE $1 LIMIT 1",
            [`%${phone}%`]
          );
          if (phoneRes.rows.length > 0) {
            match = { found: true, sessionId: phoneRes.rows[0].session_id, nombre: phoneRes.rows[0].nombre, telefono: phoneRes.rows[0].session_id, confidence: "alto" };
            break;
          }
        }
      }

      // 2b. Match by name (fuzzy)
      if (!match.found && extracted.nombre) {
        const nameParts = extracted.nombre.trim().split(/\s+/);
        // Try full name first, then last name, then first name
        for (const nameQuery of [extracted.nombre, ...nameParts.filter((p: string) => p.length > 2)]) {
          const nameRes = await pool.query(
            "SELECT session_id, nombre, telefono FROM contacts WHERE nombre ILIKE $1 LIMIT 1",
            [`%${nameQuery}%`]
          );
          if (nameRes.rows.length > 0) {
            match = { found: true, sessionId: nameRes.rows[0].session_id, nombre: nameRes.rows[0].nombre, telefono: nameRes.rows[0].session_id, confidence: nameQuery === extracted.nombre ? "alto" : "medio" };
            break;
          }
        }
      }

      // 2c. Match by address in recent messages
      if (!match.found && extracted.direccion) {
        const addrParts = extracted.direccion.split(/[,\s]+/).filter((p: string) => p.length > 4);
        for (const addr of addrParts.slice(0, 3)) {
          const addrRes = await pool.query(
            `SELECT DISTINCT m.session_id, c.nombre FROM messages m
             JOIN contacts c ON c.session_id = m.session_id
             WHERE m.mensaje ILIKE $1 AND m.is_bot = false AND m.fecha_creacion > NOW() - interval '30 days'
             LIMIT 1`,
            [`%${addr}%`]
          );
          if (addrRes.rows.length > 0) {
            match = { found: true, sessionId: addrRes.rows[0].session_id, nombre: addrRes.rows[0].nombre, telefono: addrRes.rows[0].session_id, confidence: "bajo" };
            break;
          }
        }
      }

      results.push({ filename, url, extracted, match });
    }

    return NextResponse.json({ results, folder: `/uploads/guias/${today}` });
  } catch (e: any) {
    console.error("[Guias Process]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
