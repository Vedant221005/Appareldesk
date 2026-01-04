import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { couponSchema } from "@/lib/validations/discount"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET single coupon
export const GET = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id: id },
      include: {
        discountOffer: true,
        contact: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    )
  }
})

// PUT update coupon
export const PUT = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = couponSchema.parse(body)

    // Check if code is taken by another coupon
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCoupon && existingCoupon.id !== id) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.update({
      where: { id: id },
      data: {
        code: validatedData.code,
        name: validatedData.name,
        description: validatedData.description || null,
        discountOfferId: validatedData.discountOfferId,
        maxUsageCount: validatedData.maxUsageCount,
        maxUsagePerUser: validatedData.maxUsagePerUser,
        isActive: validatedData.isActive,
        contactId: validatedData.contactId || null,
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating coupon:", error)
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    )
  }
})

// DELETE coupon
export const DELETE = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    await prisma.coupon.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    )
  }
})
