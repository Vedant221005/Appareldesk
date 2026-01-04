import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole, OrderStatus } from "@prisma/client"
import { z } from "zod"
import { sendEmail, getShippingUpdateEmail } from "@/lib/email"

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  shippingAddress: z.string().optional(),
})

// GET single order
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await prisma.saleOrder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        coupon: {
          include: {
            discountOffer: true,
          },
        },
        payments: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PATCH update order status and tracking
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateOrderSchema.parse(body)

    const updateData: any = {}

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status

      // Auto-set deliveredAt when status changes to DELIVERED
      if (validatedData.status === OrderStatus.DELIVERED) {
        updateData.deliveredAt = new Date()
      }
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber
    }

    if (validatedData.carrier !== undefined) {
      updateData.carrier = validatedData.carrier
    }

    if (validatedData.estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = new Date(validatedData.estimatedDelivery)
    }

    if (validatedData.shippingAddress !== undefined) {
      updateData.shippingAddress = validatedData.shippingAddress
    }

    const order = await prisma.saleOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Send shipping update email when status changes to SHIPPED, OUT_FOR_DELIVERY, or DELIVERED
    const shippingStatuses: OrderStatus[] = [OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED]
    if (validatedData.status && shippingStatuses.includes(validatedData.status) && order.customer.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order Update - ${order.orderNumber}`,
        html: getShippingUpdateEmail(order),
      }).catch((error) => {
        console.error("Failed to send shipping update email:", error)
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
