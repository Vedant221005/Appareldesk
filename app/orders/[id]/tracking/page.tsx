"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { OrderStatus } from "@prisma/client"
import { toast } from "sonner"

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  trackingNumber: string | null
  carrier: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  orderDate: string
}

const statusColors: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-500",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-yellow-500",
  SHIPPED: "bg-purple-500",
  OUT_FOR_DELIVERY: "bg-indigo-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-emerald-500",
}

const orderTimeline: Array<{ status: OrderStatus; label: string; icon: any }> = [
  { status: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle2 },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
]

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error("Order not found")
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      toast.error("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Loading tracking information...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Button asChild>
          <Link href="/orders">View all orders</Link>
        </Button>
      </div>
    )
  }

  const getStatusProgress = () => {
    const statusOrder = [
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ]
    return statusOrder.indexOf(order.status)
  }

  const currentProgress = getStatusProgress()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/orders/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Details
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground mb-4">
            Order #{order.orderNumber}
          </p>
          <Badge className={statusColors[order.status]}>{order.status}</Badge>
        </div>

        {order.status !== "CANCELLED" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {orderTimeline.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = currentProgress >= index
                  const isCurrent = currentProgress === index

                  return (
                    <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                      {/* Icon */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-green-500 text-white scale-110"
                              : "bg-gray-200 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-green-100 animate-pulse" : ""}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        {index < orderTimeline.length - 1 && (
                          <div
                            className={`absolute left-6 top-12 w-0.5 h-12 transition-colors ${
                              isCompleted ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <p
                          className={`font-semibold text-lg ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Current status
                          </p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-sm text-green-600 mt-1">Completed</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-lg mb-2">
                        Shipment Details
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Tracking Number:</span>{" "}
                          {order.trackingNumber}
                        </p>
                        {order.carrier && (
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Carrier:</span>{" "}
                            {order.carrier}
                          </p>
                        )}
                        {order.estimatedDelivery && (
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Estimated Delivery:</span>{" "}
                            {new Date(order.estimatedDelivery).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {order.deliveredAt && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg mb-1">
                        Delivered Successfully!
                      </h3>
                      <p className="text-sm text-green-700">
                        {new Date(order.deliveredAt).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500 rounded-full">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 text-lg mb-1">
                    Order Cancelled
                  </h3>
                  <p className="text-sm text-red-700">
                    This order has been cancelled. If you have any questions, please
                    contact our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
