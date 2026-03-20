import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_ORIGINS = [
  "https://www.moto-dotaciones.com",
  "https://moto-dotaciones.com",
  "https://sequoiaspeed.com.co",
];

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

// GET: Published questions for a product
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400, headers: corsHeaders(origin) });
  }

  const questions = await prisma.productQuestion.findMany({
    where: { productId, isPublished: true },
    orderBy: [{ helpfulYes: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      authorName: true,
      question: true,
      answer: true,
      answeredAt: true,
      helpfulYes: true,
      helpfulNo: true,
      createdAt: true,
    },
  });

  return NextResponse.json(questions, { headers: corsHeaders(origin) });
}

// POST: Submit a new question (not published until admin answers)
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  try {
    const body = await req.json();
    const { productId, authorName, authorEmail, question } = body;

    if (!productId || !authorName?.trim() || !question?.trim()) {
      return NextResponse.json(
        { error: "productId, authorName and question are required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    if (question.trim().length < 10) {
      return NextResponse.json(
        { error: "La pregunta debe tener al menos 10 caracteres" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    if (question.trim().length > 500) {
      return NextResponse.json(
        { error: "La pregunta no puede exceder 500 caracteres" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const created = await prisma.productQuestion.create({
      data: {
        productId,
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        question: question.trim(),
      },
    });

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, slug: true },
      });
      console.log(
        `[Q&A] Nueva pregunta para "${product?.name}": "${question.trim()}" — por ${authorName.trim()}`
      );
    } catch {
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true, id: created.id }, { status: 201, headers: corsHeaders(origin) });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Error al enviar pregunta" }, { status: 500, headers: corsHeaders(origin) });
  }
}
