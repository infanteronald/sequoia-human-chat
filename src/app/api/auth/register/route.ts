import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, phone, passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error al registrarse" }, { status: 500 });
  }
}
