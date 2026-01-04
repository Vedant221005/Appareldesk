import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createCashfreeOrder } from "@/lib/cashfree"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, amount } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Order ID and amount are required" },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.saleOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate unique order ID for Cashfree
    const cashfreeOrderId = `${order.orderNumber}_${Date.now()}`

    // Create Cashfree order
    const cashfreeResponse = await createCashfreeOrder(
      cashfreeOrderId,
      amount,
      order.customer.name,
      order.customer.email || "customer@example.com",
      order.customer.phone || "9999999999",
      order.customerId
    )

    // Update order status to CONFIRMED
    await prisma.saleOrder.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    })

    return NextResponse.json({
      paymentSessionId: cashfreeResponse.payment_session_id,
      cashfreeOrderId: cashfreeOrderId,
      orderId: orderId,
    })
  } catch (error: any) {
    console.error("Cashfree payment creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    )
  }
}
