import { NextResponse } from "next/server";
import { resumeTimedOutExecutions } from "@/lib/workflow-engine";

// GET /api/whatsapp/workflow-cron
// Called by PM2 cron every 30 seconds to resume delayed/timed-out workflows
export async function GET() {
  try {
    await resumeTimedOutExecutions();
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error("[WF-Cron] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
