import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/validations/contact"
import { withAdminAuth } from "@/lib/api-middleware"
import { z } from "zod"

// GET single contact
export const GET = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const contact = await prisma.contact.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    )
  }
})

// PUT update contact
export const PUT = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const body = await req.json()
    const validatedData = contactSchema.parse(body)

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: id },
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    // Check if GST number is taken by another contact
    if (validatedData.gstNumber && validatedData.gstNumber !== existingContact.gstNumber) {
      const gstTaken = await prisma.contact.findUnique({
        where: { gstNumber: validatedData.gstNumber },
      })

      if (gstTaken) {
        return NextResponse.json(
          { error: "Contact with this GST number already exists" },
          { status: 400 }
        )
      }
    }

    const contact = await prisma.contact.update({
      where: { id: id },
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

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating contact:", error)
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    )
  }
})

// DELETE contact
export const DELETE = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: id },
      include: { user: true },
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      )
    }

    // Prevent deletion if contact has a user account
    if (existingContact.user) {
      return NextResponse.json(
        { error: "Cannot delete contact with associated user account" },
        { status: 400 }
      )
    }

    await prisma.contact.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "Contact deleted successfully" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    )
  }
})
