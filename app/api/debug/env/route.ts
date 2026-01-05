import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasCashfreeAppId: !!process.env.CASHFREE_APP_ID,
    hasCashfreeSecret: !!process.env.CASHFREE_SECRET_KEY,
    hasPublicAppId: !!process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
    appIdLength: process.env.CASHFREE_APP_ID?.length || 0,
    secretLength: process.env.CASHFREE_SECRET_KEY?.length || 0,
  })
}
