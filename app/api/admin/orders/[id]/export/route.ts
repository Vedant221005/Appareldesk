import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Fetch order with all relations
    const order = await prisma.saleOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        coupon: {
          include: {
            discountOffer: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Return formatted data for PDF generation
    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate.toISOString(),
        status: order.status,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          address: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          pincode: order.customer.pincode,
        },
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        payments: order.payments.map((p) => ({
          amount: p.amount,
          method: p.method,
          status: p.status,
          paymentDate: p.paymentDate.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error("Export order error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order data" },
      { status: 500 }
    )
  }
}
