import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyCashfreePayment } from "@/lib/cashfree"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const verifyPaymentSchema = z.object({
  orderId: z.string(),
  cashfreeOrderId: z.string(),
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
    const validatedData = verifyPaymentSchema.parse(body)

    // Verify order exists and belongs to user
    const order = await prisma.saleOrder.findUnique({
      where: { id: validatedData.orderId },
      include: { 
        customer: {
          include: {
            user: true
          }
        },
        items: true,
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

    // Verify payment with Cashfree
    const payments = await verifyCashfreePayment(validatedData.cashfreeOrderId)

    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    const payment = payments[0]
    const isSuccess = payment.payment_status === "SUCCESS"

    if (!isSuccess) {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      )
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        saleOrderId: order.id,
        cashfreeOrderId: validatedData.cashfreeOrderId,
      },
      data: {
        status: "COMPLETED",
        cashfreePaymentId: payment.cf_payment_id,
      },
    })

    // Update order status
    await prisma.saleOrder.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
    })

    // Update product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
