"use client"

import { useRequireCustomer } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/user-nav"
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Package,
  Menu,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"

const navigation = [
  {
    name: "Home",
    href: "/shop",
    icon: Home,
  },
  {
    name: "Products",
    href: "/shop/products",
    icon: Package,
  },
  {
    name: "Cart",
    href: "/cart",
    icon: ShoppingCart,
  },
  {
    name: "My Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    name: "Profile",
    href: "/shop/profile",
    icon: User,
  },
]

export function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, status } = useRequireCustomer()
  const pathname = usePathname()
  const { totalItems } = useCart()
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <Link href="/shop" className="flex items-center group">
                <h1 className="text-2xl font-bold text-primary group-hover:scale-105 transition-transform">ApparelDesk</h1>
              </Link>
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const isActive = 
                    pathname === item.href || 
                    (item.href !== "/shop" && pathname?.startsWith(item.href + "/"))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-black font-semibold"
                          : "text-white hover:text-primary"
                      )}
                    >
                      <item.icon className={isActive ? "h-4 w-4 text-black" : "h-4 w-4 text-primary"} />
                      {item.name}
                      {item.href === "/cart" && totalItems > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-black">
                          {totalItems}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/cart" className="relative hover:scale-110 transition-transform md:hidden">
                <ShoppingCart className="h-5 w-5 text-primary" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-black">
                    {totalItems}
                  </Badge>
                )}
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      <div className={cn(
        "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-800 shadow-2xl transform transition-transform duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
              <h2 className="text-xl font-bold text-primary">ApparelDesk</h2>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-white hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = 
                pathname === item.href || 
                (item.href !== "/shop" && pathname?.startsWith(item.href + "/"))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-black font-semibold"
                      : "text-white hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon className={isActive ? "h-5 w-5 text-black" : "h-5 w-5 text-primary"} />
                  <span className="flex-1">{item.name}</span>
                  {item.href === "/cart" && totalItems > 0 && (
                    <Badge className="h-6 w-6 flex items-center justify-center p-0 text-xs bg-primary text-black">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation - Removed as we now have the sidebar */}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-black mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-2xl font-bold text-primary mb-3">ApparelDesk</h2>
              <p className="text-gray-400 text-sm">
                Your complete apparel management solution. Quality products, seamless shopping experience.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop/products" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop/profile" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@appareldesk.com" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; 2026 ApparelDesk. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/shop" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
