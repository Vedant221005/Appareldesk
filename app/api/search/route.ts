import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all" // all, products, orders, customers

    if (!query || query.length < 2) {
      return NextResponse.json({
        products: [],
        orders: [],
        customers: [],
      })
    }

    const isAdmin = session.user.role === "ADMIN"
    const results: any = {
      products: [],
      orders: [],
      customers: [],
    }

    // Search Products
    if (type === "all" || type === "products") {
      results.products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          price: true,
          stock: true,
          images: true,
        },
        take: 5,
      })
    }

    // Search Orders (Admin or own orders)
    if (type === "all" || type === "orders") {
      const orderWhere: any = {
        OR: [
          { orderNumber: { contains: query, mode: "insensitive" } },
        ],
      }

      if (!isAdmin && session.user.contactId) {
        orderWhere.customerId = session.user.contactId
      }

      results.orders = await prisma.saleOrder.findMany({
        where: orderWhere,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          orderDate: true,
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        take: 5,
        orderBy: { orderDate: "desc" },
      })
    }

    // Search Customers (Admin only)
    if (isAdmin && (type === "all" || type === "customers")) {
      results.customers = await prisma.contact.findMany({
        where: {
          type: "CUSTOMER",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
        },
        take: 5,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    )
  }
}
