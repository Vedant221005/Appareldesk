import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { discountOfferSchema } from "@/lib/validations/discount"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET single discount offer
export const GET = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const offer = await prisma.discountOffer.findUnique({
      where: { id: id },
    })

    if (!offer) {
      return NextResponse.json(
        { error: "Discount offer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error("Error fetching discount offer:", error)
    return NextResponse.json(
      { error: "Failed to fetch discount offer" },
      { status: 500 }
    )
  }
})

// PUT update discount offer
export const PUT = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = discountOfferSchema.parse(body)

    const offer = await prisma.discountOffer.update({
      where: { id: id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        discountValue: validatedData.discountValue,
        minOrderAmount: validatedData.minOrderAmount || 0,
        maxDiscountAmount: validatedData.maxDiscountAmount || null,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(offer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating discount offer:", error)
    return NextResponse.json(
      { error: "Failed to update discount offer" },
      { status: 500 }
    )
  }
})

// DELETE discount offer
export const DELETE = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    await prisma.discountOffer.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "Discount offer deleted successfully" })
  } catch (error) {
    console.error("Error deleting discount offer:", error)
    return NextResponse.json(
      { error: "Failed to delete discount offer" },
      { status: 500 }
    )
  }
})
