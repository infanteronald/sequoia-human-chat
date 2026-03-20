import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session-token")?.value;
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });
    if (!session || session.expires < new Date()) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
