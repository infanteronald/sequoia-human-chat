import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";
import { writeFile, unlink, mkdir } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "General";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";
    const title = file.name.replace(/\.[^.]+$/, "");

    const tmpDir = "/tmp/kb-uploads";
    await mkdir(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `${Date.now()}-${file.name}`);
    await writeFile(tmpFile, buffer);

    try {
      if (ext === "pdf") {
        // Use pdftotext (poppler-utils) for PDF extraction
        const { stdout } = await execFileAsync("pdftotext", [tmpFile, "-"]);
        extractedText = stdout;
      } else if (ext === "docx") {
        // Use mammoth for DOCX
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ path: tmpFile });
        extractedText = result.value;
      } else if (["txt", "csv", "md"].includes(ext)) {
        extractedText = buffer.toString("utf-8");
      } else {
        return NextResponse.json({ error: "Formato no soportado. Usa PDF, DOCX, TXT, CSV o MD." }, { status: 400 });
      }
    } finally {
      await unlink(tmpFile).catch(() => {});
    }

    extractedText = extractedText.replace(/\n{3,}/g, "\n\n").trim();
    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({ error: "No se pudo extraer texto del archivo" }, { status: 400 });
    }

    const tokensEstimate = Math.ceil(extractedText.length / 4);

    const result = await pool.query(
      `INSERT INTO knowledge_base (title, content, source_type, file_name, category, tokens_estimate)
       VALUES ($1, $2, 'file', $3, $4, $5) RETURNING *`,
      [title, extractedText, file.name, category, tokensEstimate]
    );

    return NextResponse.json({
      item: result.rows[0],
      preview: extractedText.substring(0, 500) + (extractedText.length > 500 ? "..." : ""),
      totalChars: extractedText.length,
      tokensEstimate,
    });
  } catch (e: any) {
    console.error("[KB Upload]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
