import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: false, // Cloudflare handles SSL termination
      sameSite: "lax",
      expires,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("session-token")?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session-token");
  return response;
}
