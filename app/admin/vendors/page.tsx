import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Truck, Mail, Phone } from "lucide-react"

async function getVendors() {
  return await prisma.contact.findMany({
    where: {
      type: { in: ["VENDOR", "BOTH"] },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminVendorsPage() {
  const vendors = await getVendors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage your suppliers</p>
        </div>
        <Link href="/admin/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {vendors.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vendors yet</h3>
          <p className="text-gray-600 mb-4">
            Add vendors to manage your supply chain
          </p>
          <Link href="/admin/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{vendor.name}</h3>
                    {vendor.gstNumber && (
                      <p className="text-xs text-gray-500">GST: {vendor.gstNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {vendor.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {vendor.email}
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {vendor.phone}
                  </div>
                )}
                {vendor.city && (
                  <p className="text-gray-600">{vendor.city}, {vendor.state}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Link href={`/admin/contacts/${vendor.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Link href={`/admin/purchase-orders/new?vendorId=${vendor.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    Create PO
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
