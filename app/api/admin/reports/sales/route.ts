import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminAuth } from "@/lib/api-middleware"

// GET sales reports
export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const period = searchParams.get("period") || "month" // day, week, month, year

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // Get orders with filters
    const orders = await prisma.saleOrder.findMany({
      where: {
        orderDate: dateFilter,
        status: {
          notIn: ["DRAFT", "CANCELLED"],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        coupon: {
          include: {
            discountOffer: true,
          },
        },
        payments: true,
      },
      orderBy: {
        orderDate: "desc",
      },
    })

    // Calculate overall stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get paid vs pending
    const paidOrders = orders.filter(
      (order) =>
        order.payments.length > 0 &&
        order.payments.some((p) => p.status === "COMPLETED")
    )
    const paidRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const pendingRevenue = totalRevenue - paidRevenue

    // Group by period
    const salesByPeriod: Record<string, any> = {}
    orders.forEach((order) => {
      const date = new Date(order.orderDate)
      let key = ""

      switch (period) {
        case "day":
          key = date.toISOString().split("T")[0]
          break
        case "week":
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split("T")[0]
          break
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          break
        case "year":
          key = date.getFullYear().toString()
          break
      }

      if (!salesByPeriod[key]) {
        salesByPeriod[key] = {
          period: key,
          orders: 0,
          revenue: 0,
          discount: 0,
        }
      }

      salesByPeriod[key].orders++
      salesByPeriod[key].revenue += order.total
      salesByPeriod[key].discount += order.discount
    })

    // Top products
    const productSales: Record<string, any> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[item.productId].quantity += item.quantity
        productSales[item.productId].revenue += item.total
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    // Top customers
    const customerSales: Record<string, any> = {}
    orders.forEach((order) => {
      if (!customerSales[order.customerId]) {
        customerSales[order.customerId] = {
          customerId: order.customerId,
          name: order.customer.name,
          email: order.customer.email,
          orders: 0,
          revenue: 0,
        }
      }
      customerSales[order.customerId].orders++
      customerSales[order.customerId].revenue += order.total
    })

    const topCustomers = Object.values(customerSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    // Status breakdown
    const statusBreakdown: Record<string, number> = {}
    orders.forEach((order) => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1
    })

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalDiscount,
        averageOrderValue,
        paidRevenue,
        pendingRevenue,
      },
      salesByPeriod: Object.values(salesByPeriod).sort((a: any, b: any) =>
        a.period.localeCompare(b.period)
      ),
      topProducts,
      topCustomers,
      statusBreakdown,
    })
  } catch (error) {
    console.error("Error fetching sales reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales reports" },
      { status: 500 }
    )
  }
})
