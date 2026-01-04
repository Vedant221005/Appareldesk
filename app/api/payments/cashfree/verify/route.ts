import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyCashfreePayment } from "@/lib/cashfree"
import { prisma } from "@/lib/prisma"
import { sendEmail, getPaymentReceiptEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, cashfreeOrderId } = await req.json()

    if (!orderId || !cashfreeOrderId) {
      return NextResponse.json(
        { error: "Order ID and Cashfree order ID are required" },
        { status: 400 }
      )
    }

    // Verify payment with Cashfree
    const response = await verifyCashfreePayment(cashfreeOrderId)

    if (!response || response.length === 0) {
      return NextResponse.json(
        { error: "No payment found" },
        { status: 404 }
      )
    }

    const payment = response[0]

    // Check payment status
    if (payment.payment_status !== "SUCCESS") {
      return NextResponse.json(
        { error: "Payment not successful", status: payment.payment_status },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.saleOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Record payment
    const paymentRecord = await prisma.payment.create({
      data: {
        saleOrderId: orderId,
        amount: payment.payment_amount,
        status: "COMPLETED",
        method: "CASHFREE",
        paymentDate: new Date(),
        transactionId: payment.cf_payment_id?.toString() || cashfreeOrderId,
      },
    })

    // Update order status
    await prisma.saleOrder.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    })

    // Send payment receipt email (non-blocking)
    if (order.customer.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Payment Receipt - ${order.orderNumber}`,
        html: getPaymentReceiptEmail(order, {
          ...paymentRecord,
          paymentMethod: "Cashfree",
        }),
      }).catch((error) => {
        console.error("Failed to send payment receipt email:", error)
      })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.cf_payment_id,
        amount: payment.payment_amount,
        status: payment.payment_status,
      },
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    )
  }
}
