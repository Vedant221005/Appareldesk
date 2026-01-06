import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// GET single product
export const GET = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!product || product.deletedAt) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
})

// PUT update product
export const PUT = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = productSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another product (excluding deleted)
    if (validatedData.slug !== existingProduct.slug) {
      const slugTaken = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugTaken && !slugTaken.deletedAt) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id: id },
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

    // Clear cache for product pages
    revalidatePath('/shop/products')
    revalidatePath('/admin/products')
    revalidatePath(`/shop/products/${product.slug}`)

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
})

// DELETE product (soft delete)
export const DELETE = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!existingProduct || existingProduct.deletedAt) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Soft delete by setting deletedAt timestamp
    await prisma.product.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    })

    // Clear cache for product pages
    revalidatePath('/shop/products')
    revalidatePath('/admin/products')

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
})
