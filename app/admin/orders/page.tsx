"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Search, Package, TrendingUp, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { OrderStatus } from "@prisma/client"
import { BulkActions } from "@/components/bulk-actions"
import { BulkUpdateDialog } from "@/components/bulk-update-dialog"
import { ExcelExport } from "@/components/excel-export"
import { CsvExport } from "@/components/csv-export"

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  orderDate: string
  customer: {
    name: string
    email: string
  }
  items: any[]
  payments: any[]
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

const statusLabels: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      if (search) params.append("search", search)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map((o) => o.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, orderId])
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== orderId))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    const queryString = ids.map((id) => `id=${id}`).join("&")
    const response = await fetch(`/api/admin/orders/bulk?${queryString}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error && data.error.includes("eligible")) {
        toast.error("Only DRAFT or CANCELLED orders can be deleted. Change order status first.")
      } else {
        toast.error(data.error || "Failed to delete orders")
      }
      throw new Error(data.error || "Failed to delete orders")
    }

    if (data.skipped && data.skipped > 0) {
      toast.warning(`${data.deletedCount} deleted, ${data.skipped} skipped (only DRAFT/CANCELLED can be deleted)`)
    }

    await fetchOrders()
  }

  // Calculate stats
  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <ExcelExport type="orders" filters={{ status: statusFilter }} />
              <CsvExport type="orders" filters={{ status: statusFilter }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onUpdate={() => setShowUpdateDialog(true)}
        onDelete={handleBulkDelete}
        type="orders"
      />

      {/* Orders Table */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(order.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(order.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>₹{order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BulkUpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        selectedIds={selectedIds}
        type="orders"
        onSuccess={() => {
          setSelectedIds([])
          fetchOrders()
        }}
      />
    </div>
  )
}
