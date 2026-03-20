import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session-token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
  });

  if (!session || session.expires < new Date()) {
    return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
