"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExcelExportProps {
  type: "orders" | "products"
  filters?: Record<string, string>
}

export function ExcelExport({ type, filters = {} }: ExcelExportProps) {
  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters)
      const endpoint =
        type === "orders"
          ? `/api/admin/orders/export?${params}`
          : `/api/admin/products/export?${params}`

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error("Failed to fetch data")

      const data = await response.json()
      const items = type === "orders" ? data.orders : data.products

      if (items.length === 0) {
        toast.error("No data to export")
        return
      }

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(items)

      // Auto-size columns
      const colWidths = Object.keys(items[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...items.map((item: any) => String(item[key] || "").length)
        ),
      }))
      worksheet["!cols"] = colWidths

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        type === "orders" ? "Orders" : "Products"
      )

      // Generate filename
      const filename = `${type}-export-${new Date().toISOString().split("T")[0]}.xlsx`

      // Download
      XLSX.writeFile(workbook, filename)
      toast.success(`${items.length} ${type} exported successfully`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export to Excel
    </Button>
  )
}
