import { prisma } from "@/lib/prisma"
import { DiscountOfferForm } from "../../discount-offer-form"
import { notFound } from "next/navigation"
import { format } from "date-fns"

async function getDiscountOffer(id: string) {
  const offer = await prisma.discountOffer.findUnique({
    where: { id: id },
  })

  if (!offer) {
    notFound()
  }

  return {
    id: offer.id,
    name: offer.name,
    description: offer.description ?? "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: offer.discountValue,
    minOrderAmount: 0,
    startDate: format(new Date(offer.startDate), "yyyy-MM-dd"),
    endDate: format(new Date(offer.endDate), "yyyy-MM-dd"),
    isActive: offer.isActive,
  }
}

export default async function EditDiscountOfferPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const offer = await getDiscountOffer(id)

  return <DiscountOfferForm offer={offer} isEdit />
}
