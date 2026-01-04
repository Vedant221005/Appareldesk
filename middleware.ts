import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    const publicPaths = ["/auth/login", "/auth/signup", "/auth/error"]
    if (publicPaths.includes(path)) {
      return NextResponse.next()
    }

    // If user is authenticated, redirect from auth pages to appropriate dashboard
    if (token && publicPaths.some(p => path.startsWith(p))) {
      if (token.role === UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.redirect(new URL("/shop", req.url))
    }

    // Admin routes - only accessible by ADMIN role
    if (path.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
      if (token.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/shop", req.url))
      }
      return NextResponse.next()
    }

    // Shop routes - only accessible by CUSTOMER role
    if (path.startsWith("/shop")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
      if (token.role !== UserRole.CUSTOMER) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.next()
    }

    // API routes protection
    if (path.startsWith("/api")) {
      // Allow public API routes
      if (path.startsWith("/api/auth")) {
        return NextResponse.next()
      }

      // Protect admin API routes
      if (path.startsWith("/api/admin") && token?.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        )
      }

      // Protect customer API routes
      if (path.startsWith("/api/shop") && token?.role !== UserRole.CUSTOMER) {
        return NextResponse.json(
          { error: "Customer access required" },
          { status: 403 }
        )
      }
    }

    // Root path redirect based on role
    if (path === "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
      if (token.role === UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.redirect(new URL("/shop", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // We handle authorization in the middleware function
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
