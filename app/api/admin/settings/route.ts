import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const settingsSchema = z.object({
  companyName: z.string().optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
  companyState: z.string().optional(),
  companyPincode: z.string().optional(),
  companyGST: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  shippingFee: z.number().min(0).optional(),
  currency: z.string().optional(),
  invoicePrefix: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.systemSetting.findMany()
    
    const settingsObj: Record<string, string> = {}
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = settingsSchema.parse(body)

    // Update each setting
    await Promise.all(
      Object.entries(validatedData).map(([key, value]) => {
        if (value !== undefined) {
          return prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value), updatedAt: new Date() },
            create: {
              key,
              value: String(value),
              description: getSettingDescription(key),
            },
          })
        }
        return Promise.resolve()
      })
    )

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Update settings error:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    companyName: "Company name displayed on invoices",
    companyEmail: "Company contact email",
    companyPhone: "Company contact phone number",
    companyAddress: "Company address line",
    companyCity: "Company city",
    companyState: "Company state",
    companyPincode: "Company pincode/ZIP",
    companyGST: "Company GST/Tax registration number",
    taxRate: "Default tax rate percentage",
    shippingFee: "Default shipping fee",
    currency: "Currency symbol",
    invoicePrefix: "Invoice number prefix",
  }
  return descriptions[key] || ""
}
