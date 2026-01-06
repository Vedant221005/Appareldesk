import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Package, Users, ShoppingCart, TrendingUp, Truck, FileText } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardStats() {
  const [
    productsCount,
    customersCount,
    vendorsCount,
    saleOrdersCount,
    purchaseOrdersCount,
    invoicesCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.contact.count({ where: { type: { in: ["CUSTOMER", "BOTH"] } } }),
    prisma.contact.count({ where: { type: { in: ["VENDOR", "BOTH"] } } }),
    prisma.saleOrder.count(),
    prisma.purchaseOrder.count(),
    prisma.invoice.count(),
  ])

  return {
    productsCount,
    customersCount,
    vendorsCount,
    saleOrdersCount,
    purchaseOrdersCount,
    invoicesCount,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: "Total Products",
      value: stats.productsCount,
      icon: Package,
      description: "Active products in catalog",
    },
    {
      title: "Customers",
      value: stats.customersCount,
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Vendors",
      value: stats.vendorsCount,
      icon: Truck,
      description: "Active vendors",
    },
    {
      title: "Sale Orders",
      value: stats.saleOrdersCount,
      icon: ShoppingCart,
      description: "Total sale orders",
    },
    {
      title: "Purchase Orders",
      value: stats.purchaseOrdersCount,
      icon: TrendingUp,
      description: "Total purchase orders",
    },
    {
      title: "Invoices",
      value: stats.invoicesCount,
      icon: FileText,
      description: "Generated invoices",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative p-6">
          <h1 className="text-3xl font-bold text-gradient-primary">Welcome to ApparelDesk</h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your business
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className="card-elevated card-hover border-2 border-transparent hover:border-primary/20 transition-all overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-gradient-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/products" className="block p-3 rounded-md hover:bg-primary/10 transition-all group">
              <div className="font-medium text-white group-hover:text-primary transition-colors">Manage Products</div>
              <div className="text-sm text-gray-400">Add, edit, or remove products</div>
            </a>
            <a href="/admin/sale-orders" className="block p-3 rounded-md hover:bg-primary/10 transition-all group">
              <div className="font-medium text-white group-hover:text-primary transition-colors">View Sale Orders</div>
              <div className="text-sm text-gray-400">Check recent customer orders</div>
            </a>
            <a href="/admin/purchase-orders" className="block p-3 rounded-md hover:bg-primary/10 transition-all group">
              <div className="font-medium text-white group-hover:text-primary transition-colors">Create Purchase Order</div>
              <div className="text-sm text-gray-400">Order inventory from vendors</div>
            </a>
            <a href="/admin/reports" className="block p-3 rounded-md hover:bg-primary/10 transition-all group">
              <div className="font-medium text-white group-hover:text-primary transition-colors">View Reports</div>
              <div className="text-sm text-gray-400">Sales and purchase analytics</div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">System Status</CardTitle>
            <CardDescription className="text-gray-400 text-sm">Application health and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-white">Database Connection</span>
              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-white">Payment Gateway</span>
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                CashFree
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-white">Automatic Invoicing</span>
              <a href="/admin/settings" className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors">
                Configure
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
