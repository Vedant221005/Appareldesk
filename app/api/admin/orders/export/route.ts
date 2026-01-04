import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (status && status !== "ALL") {
      where.status = status
    }

    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const orders = await prisma.saleOrder.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
            status: true,
          },
        },
      },
      orderBy: { orderDate: "desc" },
    })

    const exportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      orderDate: order.orderDate.toISOString().split("T")[0],
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone || "",
      items: order.items.length,
      itemsList: order.items.map((i) => i.product.name).join(", "),
      subtotal: order.subtotal,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      status: order.status,
      paymentStatus: order.payments.length > 0 ? order.payments[0].status : "PENDING",
      shippingAddress: order.shippingAddress || "",
      trackingNumber: order.trackingNumber || "",
    }))

    return NextResponse.json({ orders: exportData })
  } catch (error) {
    console.error("Export orders error:", error)
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    )
  }
}
