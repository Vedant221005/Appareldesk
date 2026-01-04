import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminAuth } from "@/lib/api-middleware"

// GET inventory reports
export const GET = withAdminAuth(async (req: Request) => {
  try {
    // Get all products with sales data
    const products = await prisma.product.findMany({
      include: {
        saleOrderItems: {
          include: {
            saleOrder: true,
          },
        },
        purchaseOrderItems: true,
      },
    })

    // Calculate inventory metrics
    const inventoryReport = products.map((product) => {
      // Filter out draft and cancelled orders
      const validSaleItems = product.saleOrderItems.filter(
        (item) =>
          item.saleOrder &&
          item.saleOrder.status !== "DRAFT" &&
          item.saleOrder.status !== "CANCELLED"
      )
      
      const totalSold = validSaleItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      const totalPurchased = product.purchaseOrderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      const currentStock = product.stock
      const stockValue = currentStock * product.price

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        currentStock,
        totalSold,
        totalPurchased,
        price: product.price,
        stockValue,
        isLowStock: currentStock < 10,
        isOutOfStock: currentStock === 0,
      }
    })

    // Summary stats
    const totalProducts = products.length
    const totalStockValue = inventoryReport.reduce(
      (sum, item) => sum + item.stockValue,
      0
    )
    const lowStockProducts = inventoryReport.filter((p) => p.isLowStock).length
    const outOfStockProducts = inventoryReport.filter((p) => p.isOutOfStock).length
    const totalItemsInStock = inventoryReport.reduce(
      (sum, item) => sum + item.currentStock,
      0
    )

    // Top selling products
    const topSelling = inventoryReport
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)

    // Slow moving products
    const slowMoving = inventoryReport
      .filter((p) => p.currentStock > 0)
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 10)

    // Category breakdown
    const categoryBreakdown: Record<string, any> = {}
    inventoryReport.forEach((product) => {
      if (!categoryBreakdown[product.category]) {
        categoryBreakdown[product.category] = {
          category: product.category,
          products: 0,
          stock: 0,
          value: 0,
          sold: 0,
        }
      }
      categoryBreakdown[product.category].products++
      categoryBreakdown[product.category].stock += product.currentStock
      categoryBreakdown[product.category].value += product.stockValue
      categoryBreakdown[product.category].sold += product.totalSold
    })

    return NextResponse.json({
      summary: {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        outOfStockProducts,
        totalItemsInStock,
      },
      products: inventoryReport.sort((a, b) => b.stockValue - a.stockValue),
      topSelling,
      slowMoving,
      categoryBreakdown: Object.values(categoryBreakdown),
    })
  } catch (error) {
    console.error("Error fetching inventory reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch inventory reports" },
      { status: 500 }
    )
  }
})
