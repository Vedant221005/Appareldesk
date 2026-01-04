import { prisma } from "@/lib/prisma"
import { ContactForm } from "../../contact-form"
import { notFound } from "next/navigation"

async function getContact(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: id },
  })

  if (!contact) {
    notFound()
  }

  return contact
}

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contact = await getContact(id)

  const contactData = {
    id: contact.id,
    name: contact.name,
    email: contact.email || "",
    phone: contact.phone || "",
    address: contact.address || "",
    city: contact.city || "",
    state: contact.state || "",
    country: contact.country || "",
    pincode: contact.pincode || "",
    gstNumber: contact.gstNumber || "",
    type: contact.type,
  }

  return <ContactForm contact={contactData} isEdit />
}
