import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(4, "Pincode is required"),
})

// GET user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        name: user.contact?.name || "",
        email: user.contact?.email || user.email || "",
        phone: user.contact?.phone || "",
        address: user.contact?.address || "",
        city: user.contact?.city || "",
        state: user.contact?.state || "",
        country: user.contact?.country || "",
        pincode: user.contact?.pincode || "",
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = profileSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { contact: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user email
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: validatedData.email,
      },
    })

    // Update or create contact information
    if (user.contact) {
      // Update existing contact
      await prisma.contact.update({
        where: { id: user.contact.id },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          city: validatedData.city || null,
          state: validatedData.state || null,
          country: validatedData.country || null,
          pincode: validatedData.pincode || null,
        },
      })
    } else {
      // Create new contact if it doesn't exist
      const newContact = await prisma.contact.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          city: validatedData.city || null,
          state: validatedData.state || null,
          country: validatedData.country || null,
          pincode: validatedData.pincode || null,
          type: "CUSTOMER",
        },
      })

      // Link contact to user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { contactId: newContact.id },
      })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        pincode: validatedData.pincode,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
