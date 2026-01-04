import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { OrderStatus } from "@prisma/client"

const bulkOrderUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, "At least one order required"),
  status: z.nativeEnum(OrderStatus),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = bulkOrderUpdateSchema.parse(body)

    // Update orders
    const result = await prisma.saleOrder.updateMany({
      where: {
        id: {
          in: validatedData.orderIds,
        },
      },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `Successfully updated ${result.count} order(s) to ${validatedData.status}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Bulk order update error:", error)
    return NextResponse.json(
      { error: "Failed to update orders" },
      { status: 500 }
    )
  }
}

// Bulk delete orders (with caution)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderIds = searchParams.getAll("id")

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "No order IDs provided" },
        { status: 400 }
      )
    }

    // Only allow deletion of CANCELLED or DRAFT orders
    const orders = await prisma.saleOrder.findMany({
      where: {
        id: {
          in: orderIds,
        },
        status: {
          in: ["CANCELLED", "DRAFT"],
        },
      },
      select: {
        id: true,
      },
    })

    if (orders.length === 0) {
      return NextResponse.json(
        {
          error: "No eligible orders found. Only DRAFT or CANCELLED orders can be deleted.",
        },
        { status: 400 }
      )
    }

    const deletableIds = orders.map((o) => o.id)

    // Delete related records first
    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({
        where: { saleOrderId: { in: deletableIds } },
      })
      await tx.saleOrderItem.deleteMany({
        where: { saleOrderId: { in: deletableIds } },
      })
      await tx.saleOrder.deleteMany({
        where: { id: { in: deletableIds } },
      })
    })

    return NextResponse.json({
      success: true,
      deletedCount: deletableIds.length,
      message: `Successfully deleted ${deletableIds.length} order(s)`,
      skipped: orderIds.length - deletableIds.length,
    })
  } catch (error) {
    console.error("Bulk order delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete orders" },
      { status: 500 }
    )
  }
}
