"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface CsvExportProps {
  type: "orders" | "products"
  filters?: Record<string, string>
}

export function CsvExport({ type, filters = {} }: CsvExportProps) {
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

      // Convert to CSV
      const headers = Object.keys(items[0])
      const csvContent = [
        headers.join(","),
        ...items.map((item: any) =>
          headers
            .map((header) => {
              const value = item[header]
              // Escape commas and quotes
              if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value
            })
            .join(",")
        ),
      ].join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      toast.success(`${items.length} ${type} exported to CSV`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export to CSV
    </Button>
  )
}
