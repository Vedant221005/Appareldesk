"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface InvoiceExportProps {
  orderId: string
  orderNumber?: string
}

export function InvoiceExport({ orderId, orderNumber }: InvoiceExportProps) {
  const handleExport = async () => {
    try {
      // Fetch both order data and settings
      const [orderResponse, settingsResponse] = await Promise.all([
        fetch(`/api/admin/orders/${orderId}/export`),
        fetch(`/api/admin/settings`),
      ])

      if (!orderResponse.ok) throw new Error("Failed to fetch order data")
      
      const { order } = await orderResponse.json()
      const settings = settingsResponse.ok 
        ? (await settingsResponse.json()).settings 
        : {}

      // Create PDF
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.text("INVOICE", 105, 20, { align: "center" })

      doc.setFontSize(10)
      doc.text(settings.companyName || "ApparelDesk", 15, 35)
      if (settings.companyAddress) doc.text(settings.companyAddress, 15, 40)
      if (settings.companyCity && settings.companyState) {
        doc.text(`${settings.companyCity}, ${settings.companyState} ${settings.companyPincode || ""}`, 15, 45)
      }
      if (settings.companyPhone) doc.text(`Phone: ${settings.companyPhone}`, 15, 50)
      if (settings.companyEmail) doc.text(`Email: ${settings.companyEmail}`, 15, 55)
      if (settings.companyGST) doc.text(`GST: ${settings.companyGST}`, 15, 60)

      doc.text(`Invoice #: ${order.orderNumber}`, 120, 35)
      doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 120, 40)
      doc.text(`Status: ${order.status}`, 120, 45)

      // Customer Info
      doc.text("Bill To:", 120, 55)
      doc.text(order.customer.name, 120, 60)
      if (order.customer.email) doc.text(order.customer.email, 120, 65)
      if (order.customer.phone) doc.text(order.customer.phone, 120, 70)
      if (order.customer.address) {
        doc.text(order.customer.address, 120, 75)
        if (order.customer.city && order.customer.state) {
          doc.text(
            `${order.customer.city}, ${order.customer.state} ${order.customer.pincode || ""}`,
            120,
            80
          )
        }
      }

      // Items Table
      const currency = settings.currency || "₹"
      autoTable(doc, {
        startY: 90,
        head: [["Product", "Quantity", "Unit Price", "Total"]],
        body: order.items.map((item: any) => [
          item.name,
          item.quantity.toString(),
          `${currency}${item.unitPrice.toFixed(2)}`,
          `${currency}${item.total.toFixed(2)}`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0] },
      })

      const finalY = (doc as any).lastAutoTable.finalY || 90

      // Totals
      let yPos = finalY + 10
      doc.text("Subtotal:", 130, yPos)
      doc.text(`${currency}${order.subtotal.toFixed(2)}`, 180, yPos)
      yPos += 5

      if (order.discount > 0) {
        doc.text("Discount:", 130, yPos)
        doc.text(`-${currency}${order.discount.toFixed(2)}`, 180, yPos)
        yPos += 5
      }

      // Calculate shipping from total - subtotal - tax + discount
      const shipping = order.total - order.subtotal - order.tax + order.discount
      if (shipping > 0) {
        doc.text("Shipping:", 130, yPos)
        doc.text(`${currency}${shipping.toFixed(2)}`, 180, yPos)
        yPos += 5
      } else if (order.subtotal - order.discount >= 1000) {
        doc.text("Shipping:", 130, yPos)
        doc.text("FREE", 180, yPos)
        yPos += 5
      }

      doc.text("Tax:", 130, yPos)
      doc.text(`${currency}${order.tax.toFixed(2)}`, 180, yPos)
      yPos += 5

      doc.setFontSize(12)
      doc.setFont("", "bold")
      doc.text("Total:", 130, yPos + 3)
      doc.text(`${currency}${order.total.toFixed(2)}`, 180, yPos + 3)

      // Shipping Info
      if (order.shippingAddress) {
        doc.setFontSize(10)
        doc.setFont("", "normal")
        doc.text("Shipping Address:", 15, finalY + 40)
        doc.text(order.shippingAddress, 15, finalY + 45)
        if (order.trackingNumber) {
          doc.text(`Tracking: ${order.trackingNumber}`, 15, finalY + 50)
        }
      }

      // Save PDF
      doc.save(`invoice-${order.orderNumber}.pdf`)
      toast.success("Invoice downloaded successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to generate invoice")
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Download Invoice
    </Button>
  )
}
