import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const csvImportSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      price: z.number().positive("Price must be positive"),
      stock: z.number().int().min(0, "Stock cannot be negative"),
      category: z.string().min(1, "Category is required"),
      type: z.string().min(1, "Type is required"),
      material: z.string().optional(),
      isPublished: z.boolean().default(true),
    })
  ),
  mode: z.enum(["create", "upsert"]).default("create"),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = csvImportSchema.parse(body)

    const results = {
      success: [] as string[],
      failed: [] as { row: number; name: string; error: string }[],
    }

    for (let i = 0; i < validatedData.products.length; i++) {
      const productData = validatedData.products[i]
      
      try {
        // Generate slug from name
        const slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        if (validatedData.mode === "upsert" && productData.name) {
          // Check if product with same name exists (excluding deleted)
          const existing = await prisma.product.findFirst({
            where: { 
              name: productData.name,
              deletedAt: null,
            },
          })

          if (existing) {
            // Update existing product
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                ...productData,
                slug,
                updatedAt: new Date(),
              },
            })
          } else {
            // Create new product
            await prisma.product.create({
              data: {
                ...productData,
                slug: `${slug}-${Date.now()}`,
              },
            })
          }
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              ...productData,
              slug: `${slug}-${Date.now()}`,
            },
          })
        }

        results.success.push(productData.name)
      } catch (error: any) {
        results.failed.push({
          row: i + 1,
          name: productData.name,
          error: error.message || "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.success.length,
      failed: results.failed.length,
      details: results,
      message: `Successfully imported ${results.success.length} product(s), ${results.failed.length} failed`,
    })

    // Clear cache for product pages
    revalidatePath('/shop/products')
    revalidatePath('/admin/products')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("CSV import error:", error)
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    )
  }
}
