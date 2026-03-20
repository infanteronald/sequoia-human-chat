import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { vote } = await req.json();

    if (vote !== "yes" && vote !== "no") {
      return NextResponse.json({ error: "vote must be 'yes' or 'no'" }, { status: 400 });
    }

    const updated = await prisma.productQuestion.update({
      where: { id },
      data: vote === "yes"
        ? { helpfulYes: { increment: 1 } }
        : { helpfulNo: { increment: 1 } },
      select: { helpfulYes: true, helpfulNo: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
}
