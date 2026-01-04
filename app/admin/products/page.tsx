import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ProductsClient } from "./products-client"

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  })
  
  // Serialize dates for client component
  return products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductsClient products={products} />
    </div>
  )
}
