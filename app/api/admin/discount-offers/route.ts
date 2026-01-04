import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { discountOfferSchema } from "@/lib/validations/discount"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET all discount offers
export const GET = withAdminAuth(async (req: Request) => {
  try {
    const offers = await prisma.discountOffer.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching discount offers:", error)
    return NextResponse.json(
      { error: "Failed to fetch discount offers" },
      { status: 500 }
    )
  }
})

// POST create discount offer
export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json()
    const validatedData = discountOfferSchema.parse(body)

    const offer = await prisma.discountOffer.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minOrderAmount: validatedData.minOrderAmount || 0,
        maxDiscountAmount: validatedData.maxDiscountAmount || null,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating discount offer:", error)
    return NextResponse.json(
      { error: "Failed to create discount offer" },
      { status: 500 }
    )
  }
})
