import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ─── Addi Callback (Webhook) ─── */
// Addi calls this URL after payment is approved/declined
// Updates order status accordingly

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Addi callback received:", JSON.stringify(body));

    const { orderId, status, applicationId, approvedAmount, currency } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Find order by orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderId },
      include: { payment: true },
    });

    if (!order) {
      console.error("Addi callback: order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify the amount matches to prevent tampering
    if (approvedAmount !== undefined && approvedAmount !== null) {
      const orderTotal = Number(order.total);
      const callbackAmount = Number(approvedAmount);
      if (Math.abs(orderTotal - callbackAmount) > 1) {
        console.error("Addi callback: amount mismatch. Order:", orderTotal, "Callback:", callbackAmount);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }
    }

    // Map Addi status to our status
    const statusMap: Record<string, string> = {
      APPROVED: "APPROVED",
      DECLINED: "CANCELLED",
      PENDING: "PENDING",
    };

    const newStatus = statusMap[status?.toUpperCase()] || "PENDING";
    const newOrderStatus = newStatus === "APPROVED" ? "PAID" : newStatus === "CANCELLED" ? "CANCELLED" : "PENDING";

    // Update payment status
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: newStatus as "PENDING" | "APPROVED",
          transactionId: applicationId || null,
        },
      });
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: newOrderStatus as any },
    });

    // Create timeline event
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: newStatus === "APPROVED" ? "PAYMENT_CONFIRMED" : "ORDER_UPDATED",
        detail: `Addi ${status}: ${applicationId || ""}. Monto aprobado: ${approvedAmount || order.total} ${currency || "COP"}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Addi callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Also handle GET for verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "addi-callback" });
}
