import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Users, Mail, Phone, ShoppingBag } from "lucide-react"

async function getCustomers() {
  return await prisma.contact.findMany({
    where: {
      type: { in: ["CUSTOMER", "BOTH"] },
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          saleOrders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer base</p>
        </div>
        <Link href="/admin/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
          <p className="text-gray-600 mb-4">
            Customers will appear here when they sign up
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    {customer.user && (
                      <Badge variant="default" className="text-xs mt-1">
                        Has Account
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {customer.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </div>
                )}
                {customer.city && (
                  <p className="text-gray-600">{customer.city}, {customer.state}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b">
                <ShoppingBag className="h-4 w-4" />
                <span>{customer._count.saleOrders} orders</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/admin/contacts/${customer.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Link href={`/admin/sale-orders?customerId=${customer.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    View Orders
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
