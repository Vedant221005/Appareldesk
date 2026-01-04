import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"

async function getOrder(id: string, userId: string) {
  const order = await prisma.saleOrder.findFirst({
    where: {
      id,
      customer: {
        user: {
          id: userId,
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      coupon: {
        include: {
          discountOffer: true,
        },
      },
      payments: true,
    },
  })

  return order
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  const { id } = await params
  const order = await getOrder(id, session.user.id)

  if (!order) {
    redirect("/orders")
  }

  const payment = order.payments.find((p) => p.status === "COMPLETED")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <Card className="p-8 text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div>
              <span className="text-gray-600">Order Number:</span>{" "}
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div>
              <span className="text-gray-600">Order Date:</span>{" "}
              <span className="font-semibold">
                {format(order.orderDate, "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </Card>

        {/* Order Status */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Status</h2>
            <Badge
              variant={
                order.status === "CONFIRMED"
                  ? "default"
                  : order.status === "COMPLETED"
                  ? "secondary"
                  : "outline"
              }
            >
              {order.status}
            </Badge>
          </div>

          {payment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Payment Successful</span>
              </div>
              <div className="text-sm text-green-800 space-y-1">
                <div>
                  Payment ID: <span className="font-mono">{payment.id}</span>
                </div>
                <div>
                  Amount Paid: <span className="font-semibold">₹{payment.amount.toLocaleString()}</span>
                </div>
                <div>
                  Payment Date: {format(payment.paymentDate, "MMM dd, yyyy HH:mm")}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Category: {item.product.category}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ₹{item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <div className="font-semibold">
                  ₹{item.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount
                    {order.coupon && (
                      <span className="ml-2 text-sm font-mono">
                        ({order.coupon.code})
                      </span>
                    )}
                  </span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              </>
            )}
            {(() => {
              const shipping = order.total - order.subtotal - order.tax + order.discount
              if (shipping > 0) {
                return (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₹{shipping.toLocaleString()}</span>
                  </div>
                )
              } else if (order.subtotal - order.discount >= 1000) {
                return (
                  <div className="flex justify-between text-green-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                )
              }
              return null
            })()}
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/orders" className="flex-1">
            <Button className="w-full">View All Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
