"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Mail, 
  Search, 
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { InvoiceStatus } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Invoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  subtotal: number
  discount: number
  tax: number
  total: number
  paidAmount: number
  dueDate: string | null
  paidDate: string | null
  invoiceDate: string
  saleOrder: {
    id: string
    orderNumber: string
    customer: {
      name: string
      email: string
    }
  }
}

interface Stats {
  total: number
  totalRevenue: number
  paid: number
  outstanding: number
  overdue: number
}

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-500",
  SENT: "bg-blue-500",
  PAID: "bg-green-500",
  CANCELLED: "bg-red-500",
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalRevenue: 0,
    paid: 0,
    outstanding: 0,
    overdue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchInvoices()
  }, [search, statusFilter])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)

      const res = await fetch(`/api/admin/invoices?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(invoices.map((inv) => inv.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    return (
      <Badge className={statusColors[status]}>
        {status}
      </Badge>
    )
  }

  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status !== "PAID" &&
      invoice.dueDate &&
      new Date(invoice.dueDate) < new Date()
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-gray-400 mt-2">Manage and track all invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-400">Total Invoices</CardDescription>
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-400">Total Revenue</CardDescription>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-400">Paid Amount</CardDescription>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats.paid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-400">Outstanding</CardDescription>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{stats.outstanding.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-400">Overdue</CardDescription>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice number, order, or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Checkbox checked disabled />
              <span className="text-sm font-medium text-white">
                {selectedIds.length} invoice(s) selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedIds.length === invoices.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 text-white font-semibold">Invoice #</th>
                    <th className="text-left p-4 text-white font-semibold">Order #</th>
                    <th className="text-left p-4 text-white font-semibold">Customer</th>
                    <th className="text-left p-4 text-white font-semibold">Date</th>
                    <th className="text-left p-4 text-white font-semibold">Due Date</th>
                    <th className="text-left p-4 text-white font-semibold">Amount</th>
                    <th className="text-left p-4 text-white font-semibold">Paid</th>
                    <th className="text-left p-4 text-white font-semibold">Status</th>
                    <th className="text-left p-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedIds.includes(invoice.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(invoice.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${invoice.saleOrder.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${invoice.saleOrder.id}`}
                          className="text-gray-300 hover:text-primary"
                        >
                          {invoice.saleOrder.orderNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="text-white">{invoice.saleOrder.customer.name}</div>
                        <div className="text-gray-400 text-sm">{invoice.saleOrder.customer.email}</div>
                      </td>
                      <td className="p-4 text-gray-300">
                        {format(new Date(invoice.invoiceDate), "dd MMM yyyy")}
                      </td>
                      <td className="p-4">
                        {invoice.dueDate ? (
                          <span
                            className={
                              isOverdue(invoice) ? "text-red-500 font-medium" : "text-gray-300"
                            }
                          >
                            {format(new Date(invoice.dueDate), "dd MMM yyyy")}
                            {isOverdue(invoice) && (
                              <span className="ml-2 text-xs">(Overdue)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">
                        ₹{invoice.total.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={
                            invoice.paidAmount >= invoice.total
                              ? "text-green-500"
                              : invoice.paidAmount > 0
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }
                        >
                          ₹{invoice.paidAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(invoice.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/orders/${invoice.saleOrder.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

