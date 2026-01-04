import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint for fetching pricing-related settings
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["taxRate", "shippingFee", "currency"],
        },
      },
    })

    const settingsObj: Record<string, string> = {
      taxRate: "18",
      shippingFee: "0",
      currency: "₹",
    }

    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error("Get public settings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
