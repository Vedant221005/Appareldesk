import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { couponSchema } from "@/lib/validations/discount"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET all coupons
export const GET = withAdminAuth(async (req: Request) => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        discountOffer: true,
        contact: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
})

// POST create coupon
export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json()
    const validatedData = couponSchema.parse(body)

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.create({
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

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating coupon:", error)
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    )
  }
})
