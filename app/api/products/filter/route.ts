import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get filter parameters
    const category = searchParams.getAll("category")
    const type = searchParams.getAll("type")
    const material = searchParams.getAll("material")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const stockStatus = searchParams.get("stockStatus") // "in-stock", "low-stock", "out-of-stock"
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt" // price-asc, price-desc, name, createdAt
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    // Build where clause
    const where: any = {
      isPublished: true,
    }

    // Multi-select filters
    if (category.length > 0) {
      where.category = { in: category }
    }

    if (type.length > 0) {
      where.type = { in: type }
    }

    if (material.length > 0) {
      where.material = { in: material }
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Stock status
    if (stockStatus === "in-stock") {
      where.stock = { gt: 10 }
    } else if (stockStatus === "low-stock") {
      where.stock = { gt: 0, lte: 10 }
    } else if (stockStatus === "out-of-stock") {
      where.stock = 0
    }

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" }
    if (sortBy === "price-asc") {
      orderBy = { price: "asc" }
    } else if (sortBy === "price-desc") {
      orderBy = { price: "desc" }
    } else if (sortBy === "name") {
      orderBy = { name: "asc" }
    }

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get filter options
    const allProducts = await prisma.product.findMany({
      where: { isPublished: true },
      select: {
        category: true,
        type: true,
        material: true,
        price: true,
      },
    })

    const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))]
    const types = [...new Set(allProducts.map((p) => p.type).filter(Boolean))]
    const materials = [...new Set(allProducts.map((p) => p.material).filter(Boolean))]
    const prices = allProducts.map((p) => p.price)
    const priceRange = {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        categories: categories.sort(),
        types: types.sort(),
        materials: materials.sort(),
        priceRange,
      },
    })
  } catch (error) {
    console.error("Products filter error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
