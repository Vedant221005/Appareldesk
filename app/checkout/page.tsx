"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ShoppingBag, Loader2, Tag } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"

// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js"

interface Coupon {
  code: string
  discountOffer: {
    discountType: "PERCENTAGE" | "FIXED"
    discountValue: number
    minOrderAmount: number
    maxDiscountAmount: number | null
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items: cart, totalPrice: cartTotal, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [taxRate, setTaxRate] = useState(18)
  const [shippingFee, setShippingFee] = useState(0)
  const [currency, setCurrency] = useState("₹")

  // Fetch settings
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

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout")
    }
  }, [status, router])

  // Calculate totals
  const subtotal = cartTotal
  
  let discount = 0
  if (appliedCoupon) {
    const { discountType, discountValue, maxDiscountAmount } = appliedCoupon.discountOffer
    if (discountType === "PERCENTAGE") {
      discount = (subtotal * discountValue) / 100
      if (maxDiscountAmount && discount > maxDiscountAmount) {
        discount = maxDiscountAmount
      }
    } else {
      discount = discountValue
    }
  }

  const subtotalAfterDiscount = subtotal - discount
  const tax = (subtotalAfterDiscount * taxRate) / 100
  const shipping = subtotalAfterDiscount >= 1000 ? 0 : shippingFee
  const total = subtotalAfterDiscount + tax + shipping

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}&amount=${subtotal}`)
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Invalid coupon")
        return
      }

      setAppliedCoupon(data)
      toast.success("Coupon applied successfully!")
    } catch (error) {
      toast.error("Failed to apply coupon")
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast.success("Coupon removed")
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setProcessingPayment(true)

    try {
      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          couponCode: appliedCoupon?.code,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        toast.error(orderData.error || "Failed to create order")
        setProcessingPayment(false)
        return
      }

      // Initialize Cashfree payment
      const paymentRes = await fetch("/api/payments/cashfree/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          amount: total,
        }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        toast.error(paymentData.error || "Failed to initialize payment")
        setProcessingPayment(false)
        return
      }

      // Initialize Cashfree SDK (always use sandbox for now)
      const cashfree = await load({
        mode: "sandbox",
      })

      // Create checkout options
      const checkoutOptions = {
        paymentSessionId: paymentData.paymentSessionId,
        redirectTarget: "_self",
        returnUrl: `${window.location.origin}/orders?payment_success=true&order_id=${orderData.id}`,
      }

      // Open Cashfree checkout
      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        console.log("Cashfree checkout result:", result)
        
        if (result.error) {
          console.error("Cashfree error:", result.error)
          toast.error(result.error.message || "Payment failed")
          setProcessingPayment(false)
          return
        }

        if (result.paymentDetails) {
          console.log("Payment details:", result.paymentDetails)
          
          // Verify payment
          const verifyRes = await fetch("/api/payments/cashfree/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.id,
              cashfreeOrderId: paymentData.cashfreeOrderId,
            }),
          })

          if (verifyRes.ok) {
            // Clear cart
            clearCart()
            toast.success("Payment successful!")
            router.push(`/orders/${orderData.id}`)
          } else {
            const errorData = await verifyRes.json()
            console.error("Verification error:", errorData)
            toast.error("Payment verification failed")
          }
        }
        setProcessingPayment(false)
      }).catch((error: any) => {
        console.error("Cashfree checkout error:", error)
        toast.error("Payment process failed")
        setProcessingPayment(false)
      })
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Something went wrong")
      setProcessingPayment(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative w-20 h-20 bg-gray-100 rounded shrink-0">
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
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="font-semibold mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-4">
                <Label className="mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Have a coupon?
                </Label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1">
                      {appliedCoupon.code}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <Button onClick={applyCoupon} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{currency}{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{currency}{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {subtotalAfterDiscount >= 1000 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>{currency}{shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span>{currency}{tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>{currency}{total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
