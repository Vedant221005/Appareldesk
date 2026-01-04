import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bulkUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product required"),
  updates: z.object({
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    isPublished: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one update field is required",
  }),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = bulkUpdateSchema.parse(body)

    // Perform bulk update
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: validatedData.productIds,
        },
      },
      data: validatedData.updates,
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      message: `Successfully updated ${result.count} product(s)`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Bulk update error:", error)
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    )
  }
}

// Bulk delete
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productIds = searchParams.getAll("id")

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "No product IDs provided" },
        { status: 400 }
      )
    }

    // Check if products are used in orders
    const ordersWithProducts = await prisma.saleOrderItem.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
        saleOrder: {
          select: {
            orderNumber: true,
          },
        },
      },
    })

    if (ordersWithProducts.length > 0) {
      const usedProductIds = [...new Set(ordersWithProducts.map((item) => item.productId))]
      return NextResponse.json(
        {
          error: "Some products are used in orders and cannot be deleted",
          usedProducts: usedProductIds,
          orderCount: ordersWithProducts.length,
        },
        { status: 400 }
      )
    }

    // Delete products
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} product(s)`,
    })
  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    )
  }
}
