import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createCashfreeOrder } from "@/lib/cashfree"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = createPaymentSchema.parse(body)

    // Verify order exists and belongs to user
    const order = await prisma.saleOrder.findUnique({
      where: { id: validatedData.orderId },
      include: { 
        customer: {
          include: {
            user: true
          }
        }
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (!order.customer.user || order.customer.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Create Cashfree order
    const cashfreeOrder = await createCashfreeOrder(
      order.orderNumber,
      validatedData.amount,
      session.user.name || "Customer",
      session.user.email || "",
      order.customer.phone || "9999999999"
    )

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: validatedData.amount,
        method: "CASHFREE",
        status: "PENDING",
        cashfreeOrderId: cashfreeOrder.order_id,
        saleOrderId: order.id,
      },
    })

    return NextResponse.json({
      id: payment.id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      orderAmount: cashfreeOrder.order_amount,
      orderCurrency: cashfreeOrder.order_currency,
      cashfreeOrderId: cashfreeOrder.order_id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
