import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma, UserRole } from "@prisma/client"

/**
 * Higher-order function to protect API routes with role-based access control
 * @param handler - The API route handler function
 * @param requiredRole - The role required to access this route (optional)
 */
export function withAuth(
  handler: (req: Request, context?: any) => Promise<Response>,
  requiredRole?: UserRole
) {
  return async (req: Request, context?: any) => {
    try {
      const session = await getServerSession(authOptions)

      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 }
        )
      }

      // Check role if specified
      if (requiredRole && session.user.role !== requiredRole) {
        return NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 }
        )
      }

      // Pass the session to the handler via context
      return handler(req, { ...context, session })
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware specifically for admin routes
 */
export function withAdminAuth(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return withAuth(handler, UserRole.ADMIN)
}

/**
 * Middleware specifically for customer routes
 */
export function withCustomerAuth(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return withAuth(handler, UserRole.CUSTOMER)
}
