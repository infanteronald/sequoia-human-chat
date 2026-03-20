import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
import path from "path";

export const runtime = "nodejs";

// Increase body size limit for file uploads
export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];
const ALLOWED_VIDEO_EXTS = ["mp4", "webm", "mov"];
const ALLOWED_AUDIO_EXTS = ["ogg", "mp3", "wav", "opus", "webm"];
const ALLOWED_DOC_EXTS = ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "zip", "rar"];
const ALLOWED_EXTS = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_VIDEO_EXTS, ...ALLOWED_AUDIO_EXTS, ...ALLOWED_DOC_EXTS];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const entries = formData.getAll("files");

    // Also try individual file keys (file0, file1, etc) as fallback
    if (!entries || entries.length === 0) {
      // Try getting any file entries
      const allEntries: File[] = [];
      formData.forEach((value, key) => {
        if (value instanceof File) allEntries.push(value);
      });
      if (allEntries.length === 0) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }
      entries.push(...allEntries);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "canned");
    await mkdir(uploadDir, { recursive: true });

    const results: { url: string; type: string; name: string }[] = [];

    for (const entry of entries) {
      if (!(entry instanceof File)) continue;
      const file = entry as File;
      if (!file.name || file.size === 0) continue;

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      // Allow by extension OR MIME type
      if (!ALLOWED_EXTS.includes(ext) && !file.type?.startsWith("image/") && !file.type?.startsWith("video/") && !file.type?.startsWith("audio/")) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);

      // Detect type by extension first, then fallback to MIME type
      const mimeType = file.type || "";
      
      // Convert webm audio to ogg for WhatsApp API compatibility
      if (ext === "webm" && mimeType.startsWith("audio/")) {
        const oggFilename = filename.replace(".webm", ".ogg");
        const webmPath = path.join(uploadDir, filename);
        const oggPath = path.join(uploadDir, oggFilename);
        try {
          await execFileAsync("ffmpeg", ["-i", webmPath, "-c:a", "libopus", "-b:a", "48k", oggPath, "-y"]);
          await unlink(webmPath).catch(() => {});
          results.push({ url: `/uploads/canned/${oggFilename}`, type: "audio", name: file.name.replace(".webm", ".ogg") });
        } catch (e) {
          console.error("FFmpeg conversion failed:", e);
          results.push({ url: `/uploads/canned/${filename}`, type: "audio", name: file.name });
        }
        continue;
      }
      
      let mediaType: string;
      if (ALLOWED_IMAGE_EXTS.includes(ext) || mimeType.startsWith("image/")) {
        mediaType = "image";
      } else if (ALLOWED_VIDEO_EXTS.includes(ext) || mimeType.startsWith("video/")) {
        mediaType = "video";
      } else if (ALLOWED_AUDIO_EXTS.includes(ext) || mimeType.startsWith("audio/")) {
        mediaType = "audio";
      } else {
        mediaType = "document";
      }
      results.push({
        url: `/uploads/canned/${filename}`,
        type: mediaType,
        name: file.name,
      });
    }

    return NextResponse.json({ files: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
