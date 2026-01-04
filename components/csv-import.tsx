"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Upload, Download } from "lucide-react"

interface CsvImportProps {
  onImportComplete?: () => void
}

export function CsvImport({ onImportComplete }: CsvImportProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const downloadTemplate = () => {
    const headers = [
      "name",
      "description",
      "price",
      "stock",
      "category",
      "type",
      "material",
      "isPublished",
    ]
    const exampleRow = [
      "Classic Cotton T-Shirt",
      "Comfortable cotton t-shirt for everyday wear",
      "29.99",
      "100",
      "Topwear",
      "T-Shirt",
      "Cotton",
      "true",
    ]

    const csv = [headers.join(","), exampleRow.join(",")].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "product-import-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Accept CSV files with any MIME type (some systems use different types)
      const fileName = selectedFile.name.toLowerCase()
      if (fileName.endsWith('.csv')) {
        setFile(selectedFile)
        toast.success(`Selected: ${selectedFile.name}`)
      } else {
        toast.error("Please select a CSV file (.csv)")
        e.target.value = ""
      }
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length === 0) return []

    // Parse CSV line handling quoted values
    const parseLine = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''))

    return lines.slice(1).map((line) => {
      const values = parseLine(line).map((v) => v.replace(/^"|"$/g, ''))
      const obj: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""

        if (header === "price" || header === "stock") {
          obj[header] = value ? parseFloat(value) : 0
        } else if (header === "isPublished") {
          obj[header] = value.toLowerCase() === "true"
        } else if (value) {
          obj[header] = value
        }
      })

      return obj
    })
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setIsUploading(true)

    try {
      const text = await file.text()
      const products = parseCSV(text)

      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products,
          mode: "create",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const successCount = data.imported || data.details?.success?.length || 0
        const failedCount = data.failed || data.details?.failed?.length || 0
        
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} product(s)`)
        }
        
        if (failedCount > 0) {
          const firstError = data.details?.failed?.[0]
          const errorMsg = firstError ? `Row ${firstError.row}: ${firstError.error}` : "Check the file format"
          toast.error(`${failedCount} product(s) failed: ${errorMsg}`)
        }
        
        if (successCount > 0) {
          setOpen(false)
          setFile(null)
          onImportComplete?.()
        }
      } else {
        toast.error(data.error || "Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import products")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import products. Download the template
              to see the required format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isUploading}>
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
