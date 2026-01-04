"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Home, Package, FileText } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { useCart } from "@/lib/cart-context"

export function ShopHeader() {
  const { totalItems } = useCart()

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/shop">
            <h1 className="text-2xl font-bold text-primary">ApparelDesk</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/shop/products">
              <Button variant="ghost" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </Link>
            <Link href="/shop/orders">
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Orders
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/shop/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="ml-2 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-medium">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
