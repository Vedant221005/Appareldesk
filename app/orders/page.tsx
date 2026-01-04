"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ShoppingBag, Eye, Truck } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { OrderStatus } from "@prisma/client"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  discount: number
  tax: number
  total: number
  orderDate: string
  trackingNumber: string | null
  items: OrderItem[]
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

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    return <Badge className={statusColors[status]}>{status}</Badge>
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            Start shopping to place your first order
          </p>
          <Link href="/shop">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">View and track your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-600">
                  Ordered on {format(new Date(order.orderDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ₹{order.total.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ₹{item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-sm text-gray-500 pl-6">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Link href={`/orders/${order.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                {order.trackingNumber && (
                  <Link href={`/orders/${order.id}/tracking`} className="flex-1">
                    <Button variant="default" className="w-full">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
