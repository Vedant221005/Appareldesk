"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { UserRole } from "@prisma/client"

/**
 * Client-side hook to protect pages with role-based access
 * @param requiredRole - The role required to access the page
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/login")
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      // Redirect to appropriate dashboard
      if (session.user.role === UserRole.ADMIN) {
        router.push("/admin")
      } else {
        router.push("/shop")
      }
    }
  }, [session, status, router, requiredRole])

  return { session, status }
}

/**
 * Hook for admin-only pages
 */
export function useRequireAdmin() {
  return useRequireAuth(UserRole.ADMIN)
}

/**
 * Hook for customer-only pages
 */
export function useRequireCustomer() {
  return useRequireAuth(UserRole.CUSTOMER)
}

/**
 * Hook for pages that can be accessed with or without authentication
 */
export function useOptionalAuth() {
  const { data: session, status } = useSession()
  return { session, status }
}
