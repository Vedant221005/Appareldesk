import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET all products
export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const isPublished = searchParams.get("isPublished")

    const where: any = {
      deletedAt: null, // Exclude soft-deleted products
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (isPublished !== null && isPublished !== "") {
      where.isPublished = isPublished === "true"
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
})

// POST create product
export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    // Check if slug already exists (excluding deleted products)
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingProduct && !existingProduct.deletedAt) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        category: validatedData.category,
        type: validatedData.type,
        material: validatedData.material || null,
        price: validatedData.price,
        stock: validatedData.stock,
        images: validatedData.images || [],
        isPublished: validatedData.isPublished,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
})
