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
    const category = searchParams.get("category")
    const isPublished = searchParams.get("isPublished")

    const where: any = {
      deletedAt: null, // Exclude soft-deleted products
    }

    if (category && category !== "ALL") {
      where.category = category
    }

    if (isPublished !== null && isPublished !== "ALL") {
      where.isPublished = isPublished === "true"
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const exportData = products.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      type: product.type,
      material: product.material || "",
      price: product.price,
      stock: product.stock,
      isPublished: product.isPublished ? "Yes" : "No",
      createdAt: product.createdAt.toISOString().split("T")[0],
      updatedAt: product.updatedAt.toISOString().split("T")[0],
    }))

    return NextResponse.json({ products: exportData })
  } catch (error) {
    console.error("Export products error:", error)
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    )
  }
}
