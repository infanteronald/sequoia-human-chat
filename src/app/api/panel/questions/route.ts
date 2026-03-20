import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET: List all questions (admin)
export async function GET(req: NextRequest) {
  await requireAdmin();

  const filter = req.nextUrl.searchParams.get("filter") || "pending";

  const where = filter === "pending"
    ? { answer: null }
    : filter === "answered"
    ? { answer: { not: null } }
    : {};

  const questions = await prisma.productQuestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
    },
    take: 100,
  });

  return NextResponse.json({ questions });
}

// PATCH: Answer a question (admin)
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  try {
    const { id, answer } = await req.json();

    if (!id || !answer?.trim()) {
      return NextResponse.json(
        { error: "id and answer are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.productQuestion.update({
      where: { id },
      data: {
        answer: answer.trim(),
        answeredAt: new Date(),
        isPublished: true,
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
}
