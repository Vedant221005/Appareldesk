"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Save,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { OrderStatus } from "@prisma/client"
import { InvoiceExport } from "@/components/invoice-export"

interface OrderDetails {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  discount: number
  total: number
  orderDate: string
  trackingNumber: string | null
  carrier: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  shippingAddress: string | null
  customer: {
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string | null
    pincode: string | null
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: {
      name: string
      slug: string
      image: string | null
    }
  }>
  coupon: {
    code: string
    discountOffer: {
      discountType: string
      discountValue: number
    }
  } | null
  payments: Array<{
    id: string
    amount: number
    status: string
    method: string
    createdAt: string
  }>
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [status, setStatus] = useState<OrderStatus>("CONFIRMED")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  useEffect(() => {
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      setTrackingNumber(order.trackingNumber || "")
      setCarrier(order.carrier || "")
      setEstimatedDelivery(
        order.estimatedDelivery
          ? new Date(order.estimatedDelivery).toISOString().split("T")[0]
          : ""
      )
    }
  }, [order])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/orders/${id}`)
      if (!res.ok) throw new Error("Failed to fetch order")
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      toast.error("Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async () => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to update order")

      toast.success("Order updated successfully")
      fetchOrder()
    } catch (error) {
      toast.error("Failed to update order")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Order not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceExport orderId={order.id} orderNumber={order.orderNumber} />
          <Badge className={statusColors[order.status]}>{order.status}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded shrink-0">
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.unitPrice.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ₹{item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </p>
                  {order.customer.phone && (
                    <p className="text-sm text-muted-foreground">
                      {order.customer.phone}
                    </p>
                  )}
                </div>
                {order.customer.address && (
                  <div className="pt-2">
                    <p className="flex items-center gap-2 text-sm font-medium mb-1">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </p>
                    <p className="text-sm text-muted-foreground pl-6">
                      {order.customer.address}
                      {order.customer.city && `, ${order.customer.city}`}
                      {order.customer.state && `, ${order.customer.state}`}
                      {order.customer.pincode && ` - ${order.customer.pincode}`}
                      {order.customer.country && `, ${order.customer.country}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{payment.method}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            payment.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Order Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as OrderStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">
                      Out for Delivery
                    </SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., FedEx, DHL"
                />
              </div>

              <div>
                <Label htmlFor="delivery">Estimated Delivery</Label>
                <Input
                  id="delivery"
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:saturate-100 [&::-webkit-calendar-picker-indicator]:hue-rotate-0 [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:contrast-200 [&::-webkit-calendar-picker-indicator]:hue-rotate-[-10deg]"
                />
              </div>

              {order.deliveredAt && (
                <div className="pt-2">
                  <p className="text-sm font-medium">Delivered</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpdateOrder}
                disabled={updating}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {updating ? "Updating..." : "Update Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
