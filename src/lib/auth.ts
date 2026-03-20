import { prisma } from "./prisma";
import { cookies } from "next/headers";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!session || session.expires < new Date()) return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
