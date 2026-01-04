import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, UserCircle, Mail, Phone } from "lucide-react"
import { ContactActions } from "./contact-actions"

async function getContacts() {
  return await prisma.contact.findMany({
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminContactsPage() {
  const contacts = await getContacts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Contacts</h1>
          <p className="text-gray-600 mt-1">Manage customers and vendors</p>
        </div>
        <Link href="/admin/contacts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </Link>
      </div>

      {contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <UserCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first contact
          </p>
          <Link href="/admin/contacts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-900/50">
                <tr>
                  <th className="text-left p-4 font-medium text-white">Contact</th>
                  <th className="text-left p-4 font-medium text-white">Type</th>
                  <th className="text-left p-4 font-medium text-white">Email</th>
                  <th className="text-left p-4 font-medium text-white">Phone</th>
                  <th className="text-left p-4 font-medium text-white">City</th>
                  <th className="text-center p-4 font-medium text-white">Has Account</th>
                  <th className="text-right p-4 font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{contact.name}</div>
                          {contact.gstNumber && (
                            <div className="text-sm text-gray-500">GST: {contact.gstNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={
                        contact.type === "CUSTOMER" ? "default" :
                        contact.type === "VENDOR" ? "secondary" : "outline"
                      }>
                        {contact.type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        {contact.email ? (
                          <>
                            <Mail className="h-4 w-4 text-gray-400" />
                            {contact.email}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        {contact.phone ? (
                          <>
                            <Phone className="h-4 w-4 text-gray-400" />
                            {contact.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">
                      {contact.city || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      {contact.user ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <ContactActions contact={contact} hasUser={!!contact.user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
