import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const amount = parseFloat(searchParams.get("amount") || "0")

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { discountOffer: true },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      )
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Coupon is not active" },
        { status: 400 }
      )
    }

    const offer = coupon.discountOffer
    const now = new Date()

    // Check if offer is active and within date range
    if (!offer.isActive) {
      return NextResponse.json(
        { error: "Discount offer is not active" },
        { status: 400 }
      )
    }

    if (now < offer.startDate) {
      return NextResponse.json(
        { error: "Coupon is not yet valid" },
        { status: 400 }
      )
    }

    if (now > offer.endDate) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (amount < offer.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${offer.minOrderAmount}` },
        { status: 400 }
      )
    }

    // Check usage limits
    if (coupon.usedCount >= coupon.maxUsageCount) {
      return NextResponse.json(
        { error: "Coupon usage limit exceeded" },
        { status: 400 }
      )
    }

    // Check per-user usage limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.contactId) {
      const userUsageCount = await prisma.saleOrder.count({
        where: {
          customerId: user.contactId,
          couponId: coupon.id,
        },
      })

      if (userUsageCount >= coupon.maxUsagePerUser) {
        return NextResponse.json(
          { error: "You have already used this coupon maximum times" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      code: coupon.code,
      discountOffer: {
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        minOrderAmount: offer.minOrderAmount,
        maxDiscountAmount: offer.maxDiscountAmount,
      },
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
