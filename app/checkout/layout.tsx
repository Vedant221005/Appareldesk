"use client"

import { CartProvider } from "@/lib/cart-context"
import { CustomerLayout } from "@/components/customer-layout"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <CustomerLayout>{children}</CustomerLayout>
    </CartProvider>
  )
}
