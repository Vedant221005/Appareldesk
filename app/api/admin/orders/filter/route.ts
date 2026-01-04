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
    
    // Get filter parameters
    const status = searchParams.getAll("status")
    const paymentStatus = searchParams.get("paymentStatus") // "paid", "pending", "failed"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const minAmount = searchParams.get("minAmount")
    const maxAmount = searchParams.get("maxAmount")
    const customerSearch = searchParams.get("customer")
    const orderNumber = searchParams.get("orderNumber")
    const hasCoupon = searchParams.get("hasCoupon") // "true", "false"
    const sortBy = searchParams.get("sortBy") || "orderDate" // orderDate, total, orderNumber
    const sortOrder = searchParams.get("sortOrder") || "desc" // asc, desc
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // Build where clause
    const where: any = {}

    // Status filter (multi-select)
    if (status.length > 0) {
      where.status = { in: status }
    }

    // Date range
    if (startDate || endDate) {
      where.orderDate = {}
      if (startDate) where.orderDate.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.orderDate.lte = end
      }
    }

    // Amount range
    if (minAmount || maxAmount) {
      where.total = {}
      if (minAmount) where.total.gte = parseFloat(minAmount)
      if (maxAmount) where.total.lte = parseFloat(maxAmount)
    }

    // Customer search
    if (customerSearch) {
      where.customer = {
        OR: [
          { name: { contains: customerSearch, mode: "insensitive" } },
          { email: { contains: customerSearch, mode: "insensitive" } },
          { phone: { contains: customerSearch, mode: "insensitive" } },
        ],
      }
    }

    // Order number search
    if (orderNumber) {
      where.orderNumber = { contains: orderNumber, mode: "insensitive" }
    }

    // Coupon filter
    if (hasCoupon === "true") {
      where.couponId = { not: null }
    } else if (hasCoupon === "false") {
      where.couponId = null
    }

    // Payment status filter
    if (paymentStatus) {
      if (paymentStatus === "paid") {
        where.payments = {
          some: {
            status: "COMPLETED",
          },
        }
      } else if (paymentStatus === "pending") {
        where.OR = [
          { payments: { none: {} } },
          {
            payments: {
              every: {
                status: { not: "COMPLETED" },
              },
            },
          },
        ]
      }
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === "total") {
      orderBy.total = sortOrder
    } else if (sortBy === "orderNumber") {
      orderBy.orderNumber = sortOrder
    } else {
      orderBy.orderDate = sortOrder
    }

    // Get total count
    const total = await prisma.saleOrder.count({ where })

    // Get orders
    const orders = await prisma.saleOrder.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            paymentDate: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Orders filter error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
