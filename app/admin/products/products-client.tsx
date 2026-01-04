"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Plus, Package } from "lucide-react"
import { ProductActions } from "./product-actions"
import { BulkActions } from "@/components/bulk-actions"
import { BulkUpdateDialog } from "@/components/bulk-update-dialog"
import { CsvImport } from "@/components/csv-import"
import { ExcelExport } from "@/components/excel-export"
import { CsvExport } from "@/components/csv-export"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  slug: string
  category: string
  type: string
  price: number
  stock: number
  isPublished: boolean
  images: string[] | null
}

interface ProductsClientProps {
  products: Product[]
}

export function ProductsClient({ products }: ProductsClientProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, productId])
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== productId))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    const queryString = ids.map((id) => `id=${id}`).join("&")
    const response = await fetch(`/api/admin/products/bulk?${queryString}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to delete products")
    }

    router.refresh()
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-white">No products yet</h3>
        <p className="text-gray-400 mb-4">
          Get started by creating your first product
        </p>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <CsvImport onImportComplete={() => router.refresh()} />
          <ExcelExport type="products" />
          <CsvExport type="products" />
        </div>
      </div>

      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onUpdate={() => setShowUpdateDialog(true)}
        onDelete={handleBulkDelete}
        type="products"
      />

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="text-left p-4 font-medium w-12">
                  <Checkbox
                    checked={selectedIds.length === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-white">Product</th>
                <th className="text-left p-4 font-medium text-white">Category</th>
                <th className="text-left p-4 font-medium text-white">Type</th>
                <th className="text-right p-4 font-medium text-white">Price</th>
                <th className="text-right p-4 font-medium text-white">Stock</th>
                <th className="text-center p-4 font-medium text-white">Status</th>
                <th className="text-right p-4 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(product.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-800 rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white">{product.category}</td>
                  <td className="p-4 text-white">{product.type}</td>
                  <td className="p-4 text-right font-medium">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={
                        product.stock <= 10 ? "text-red-600 font-medium" : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {product.isPublished ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <ProductActions product={product} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <BulkUpdateDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        selectedIds={selectedIds}
        type="products"
        onSuccess={() => {
          setSelectedIds([])
          router.refresh()
        }}
      />
    </>
  )
}
