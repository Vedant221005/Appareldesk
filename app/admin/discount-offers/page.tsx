import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Percent, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { DiscountOfferActions } from "./discount-offer-actions"
import type { DiscountOffer } from "@prisma/client"

async function getDiscountOffers(): Promise<DiscountOffer[]> {
  return await prisma.discountOffer.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminDiscountOffersPage() {
  const offers = await getDiscountOffers()

  const activeOffers = offers.filter((o) => o.isActive && new Date() >= o.startDate && new Date() <= o.endDate).length
  const scheduledOffers = offers.filter((o) => o.isActive && new Date() < o.startDate).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discount Offers</h1>
          <p className="text-gray-600 mt-1">Manage promotional discounts</p>
        </div>
        <Link href="/admin/discount-offers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Percent className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Offers</p>
              <p className="text-2xl font-bold">{activeOffers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold">{scheduledOffers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Offers</p>
              <p className="text-2xl font-bold">{offers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <Card className="p-12 text-center">
          <Percent className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first discount offer to boost sales
          </p>
          <Link href="/admin/discount-offers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="text-left p-4 font-medium text-white">Offer Name</th>
                  <th className="text-left p-4 font-medium text-white">Type</th>
                  <th className="text-left p-4 font-medium text-white">Value</th>
                  <th className="text-left p-4 font-medium text-white">Min Order</th>
                  <th className="text-left p-4 font-medium text-white">Period</th>
                  <th className="text-center p-4 font-medium text-white">Status</th>
                  <th className="text-right p-4 font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const now = new Date()
                  const isActive = offer.isActive && now >= offer.startDate && now <= offer.endDate
                  const isScheduled = offer.isActive && now < offer.startDate
                  const isExpired = now > offer.endDate

                  return (
                    <tr key={offer.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                      <td className="p-4">
                        <div className="font-medium text-white">{offer.name}</div>
                        {offer.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {offer.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {offer.discountType === "PERCENTAGE" ? "Percentage" : "Fixed"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600">
                          {offer.discountType === "PERCENTAGE"
                            ? `${offer.discountValue}%`
                            : `₹${offer.discountValue}`}
                        </span>
                      </td>
                      <td className="p-4 text-white">₹{offer.minOrderAmount.toLocaleString()}</td>
                      <td className="p-4 text-sm">
                        <div className="text-white">{format(new Date(offer.startDate), "MMM dd, yyyy")}</div>
                        <div className="text-gray-400">
                          to {format(new Date(offer.endDate), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isActive && <Badge variant="default">Active</Badge>}
                        {isScheduled && <Badge variant="secondary">Scheduled</Badge>}
                        {isExpired && <Badge variant="outline">Expired</Badge>}
                        {!offer.isActive && <Badge variant="outline">Inactive</Badge>}
                      </td>
                      <td className="p-4">
                        <DiscountOfferActions offer={offer} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
