import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations/contact"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET all contacts
export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search") || ""

    const where: any = {}

    if (type && type !== "ALL") {
      where.type = type === "CUSTOMER" ? { in: ["CUSTOMER", "BOTH"] } : { in: ["VENDOR", "BOTH"] }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
})

// POST create contact
export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json()
    const validatedData = contactSchema.parse(body)

    // Check if GST number already exists
    if (validatedData.gstNumber) {
      const existingContact = await prisma.contact.findUnique({
        where: { gstNumber: validatedData.gstNumber },
      })

      if (existingContact) {
        return NextResponse.json(
          { error: "Contact with this GST number already exists" },
          { status: 400 }
        )
      }
    }

    const contact = await prisma.contact.create({
      data: {
        type: validatedData.type,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || null,
        pincode: validatedData.pincode || null,
        gstNumber: validatedData.gstNumber || null,
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating contact:", error)
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    )
  }
})
