"use client"

import { useRequireAdmin } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user-nav"
import { GlobalSearch } from "@/components/global-search"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  Receipt,
  Tags,
  Settings,
  TrendingUp,
  UserCircle,
  Truck,
  HelpCircle,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Vendors",
    href: "/admin/vendors",
    icon: Truck,
  },
  {
    name: "Contacts",
    href: "/admin/contacts",
    icon: UserCircle,
  },
  {
    name: "Sale Orders",
    href: "/admin/sale-orders",
    icon: ShoppingCart,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    name: "Purchase Orders",
    href: "/admin/purchase-orders",
    icon: Receipt,
  },
  {
    name: "Vendor Bills",
    href: "/admin/vendor-bills",
    icon: CreditCard,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Discount Offers",
    href: "/admin/discount-offers",
    icon: Tags,
  },
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: Tags,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/admin/help",
    icon: HelpCircle,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, status } = useRequireAdmin()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-64 bg-black text-white border-r border-black overflow-y-auto custom-scrollbar flex-col">
        <div className="p-6 border-b border-gray-900">
          <h1 className="text-2xl font-bold text-primary">ApparelDesk</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <nav className="px-3 pb-6 pt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-2 group",
                  isActive
                    ? "bg-primary text-black font-semibold"
                    : "text-white hover:text-primary"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "text-black" : "text-primary"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Menu */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-800 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto custom-scrollbar",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-900">
            <div>
              <h1 className="text-xl font-bold text-primary">ApparelDesk</h1>
              <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-white hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 pb-6 pt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-2 group",
                    isActive
                      ? "bg-primary text-black font-semibold"
                      : "text-white hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "text-black" : "text-primary"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-black border-b border-black px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl lg:text-2xl font-semibold text-primary">
                {navigation.find((item) => pathname === item.href)?.name || "Admin"}
              </h2>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>
              <UserNav />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
