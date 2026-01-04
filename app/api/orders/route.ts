import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { sendEmail, getOrderConfirmationEmail } from "@/lib/email"

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  couponCode: z.string().optional(),
})

// POST create order
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    console.log("Session in orders API:", JSON.stringify(session, null, 2))

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    if (!session.user.id) {
      console.error("Session user has no ID:", session.user)
      return NextResponse.json(
        { error: "Invalid session - user ID missing" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = createOrderSchema.parse(body)

    // Get customer contact
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: true },
    })

    console.log("Found user:", user ? { id: user.id, contactId: user.contactId, hasContact: !!user.contact } : null)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.contact) {
      console.error("User has no contact:", { userId: user.id, contactId: user.contactId })
      return NextResponse.json(
        { error: "Customer profile not found - please contact support" },
        { status: 404 }
      )
    }

    // Validate products and calculate totals
    const productIds = validatedData.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 404 }
      )
    }

    // Check stock availability
    for (const item of validatedData.items) {
      const product = products.find((p: typeof products[number]) => p.id === item.productId)
      if (product && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate subtotal
    let subtotal = 0
    for (const item of validatedData.items) {
      const product = products.find((p: typeof products[number]) => p.id === item.productId)
      if (!product) continue
      subtotal += product.price * item.quantity
    }

    // Apply coupon if provided
    let discount = 0
    let coupon = null
    let couponId = null

    if (validatedData.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: validatedData.couponCode },
        include: { discountOffer: true },
      })

      if (coupon && coupon.isActive) {
        const offer = coupon.discountOffer
        const now = new Date()

        // Check if offer is valid
        if (
          offer.isActive &&
          now >= offer.startDate &&
          now <= offer.endDate &&
          subtotal >= offer.minOrderAmount
        ) {
          // Check usage limits
          if (coupon.usedCount >= coupon.maxUsageCount) {
            return NextResponse.json(
              { error: "Coupon usage limit exceeded" },
              { status: 400 }
            )
          }

          // Check per-user usage limit
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

          // Calculate discount
          if (offer.discountType === "PERCENTAGE") {
            discount = (subtotal * offer.discountValue) / 100
            if (offer.maxDiscountAmount && discount > offer.maxDiscountAmount) {
              discount = offer.maxDiscountAmount
            }
          } else {
            discount = offer.discountValue
          }

          couponId = coupon.id
        }
      }
    }

    // Fetch settings for tax and shipping
    const settings = await prisma.systemSetting.findMany()
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
    
    const taxRate = parseFloat(settingsMap.taxRate || "18") // Default 18%
    const shippingFee = parseFloat(settingsMap.shippingFee || "0") // Default 0
    
    // Calculate subtotal after discount
    const subtotalAfterDiscount = subtotal - discount
    
    // Calculate tax
    const tax = (subtotalAfterDiscount * taxRate) / 100
    
    // Apply shipping fee (free shipping for orders >= 1000)
    const shipping = subtotalAfterDiscount >= 1000 ? 0 : shippingFee
    
    // Calculate final total
    const total = subtotalAfterDiscount + tax + shipping

    // Generate unique order number with timestamp to avoid duplicates
    const timestamp = Date.now()
    const orderCount = await prisma.saleOrder.count()
    const orderNumber = `SO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, "0")}-${timestamp.toString().slice(-4)}`

    // Create order
    const order = await prisma.saleOrder.create({
      data: {
        orderNumber,
        customerId: user.contactId,
        status: "DRAFT",
        subtotal,
        discount,
        tax,
        total,
        couponId,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update coupon usage count
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Send order confirmation email (non-blocking)
    if (order.customer.email) {
      sendEmail({
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: getOrderConfirmationEmail(order),
      }).catch((error) => {
        console.error("Failed to send order confirmation email:", error)
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

// GET user's orders
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await prisma.saleOrder.findMany({
      where: {
        customer: {
          user: {
            id: session.user.id,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        coupon: {
          include: {
            discountOffer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
