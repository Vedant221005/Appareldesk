"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2, ShoppingBag, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const [taxRate, setTaxRate] = useState(18)
  const [shippingFee, setShippingFee] = useState(0)
  const [currency, setCurrency] = useState("₹")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/cart")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTaxRate(parseFloat(data.settings.taxRate || "18"))
          setShippingFee(parseFloat(data.settings.shippingFee || "0"))
          setCurrency(data.settings.currency || "₹")
        }
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link href="/shop/products">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{totalItems} items in your cart</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            clearCart()
            toast.success("Cart cleared")
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 bg-gray-100 rounded shrink-0">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.productName}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeItem(item.productId)
                        toast.success("Item removed from cart")
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">₹{(item.price * item.quantity).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">{currency}{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                {totalPrice >= 1000 ? (
                  <span className="font-medium text-green-600">FREE</span>
                ) : (
                  <span className="font-medium">{currency}{shippingFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({taxRate}%)</span>
                <span className="font-medium">{currency}{(totalPrice * taxRate / 100).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{currency}{(totalPrice + (totalPrice >= 1000 ? 0 : shippingFee) + (totalPrice * taxRate / 100)).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full mb-3" 
              size="lg"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </Button>

            <Link href="/shop/products">
              <Button variant="outline" className="w-full mt-3">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
