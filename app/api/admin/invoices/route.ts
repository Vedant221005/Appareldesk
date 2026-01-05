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
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { saleOrder: { orderNumber: { contains: search, mode: "insensitive" } } },
        { saleOrder: { customer: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.invoiceDate = {}
      if (startDate) {
        where.invoiceDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.invoiceDate.lte = new Date(endDate)
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        saleOrder: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { invoiceDate: "desc" },
    })

    // Calculate stats
    const stats = {
      total: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      paid: invoices.filter((inv) => inv.status === "PAID").reduce((sum, inv) => sum + inv.paidAmount, 0),
      outstanding: invoices.filter((inv) => inv.status !== "PAID").reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0),
      overdue: invoices.filter((inv) => {
        return inv.status !== "PAID" && inv.dueDate && new Date(inv.dueDate) < new Date()
      }).length,
    }

    return NextResponse.json({ invoices, stats })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}
