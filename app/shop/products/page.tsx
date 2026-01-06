import { prisma } from "@/lib/prisma"
import { ProductCard } from "./product-card"
import { ProductFilters } from "./product-filters"
import { Prisma } from "@prisma/client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProducts(searchParams: {
  category?: string
  type?: string
  material?: string
  search?: string
}) {
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    deletedAt: null, // Exclude soft-deleted products
  }

  if (searchParams.category) {
    where.category = searchParams.category
  }

  if (searchParams.type) {
    where.type = searchParams.type
  }

  if (searchParams.material) {
    where.material = searchParams.material
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return products
}

async function getFilterOptions() {
  const products = await prisma.product.findMany({
    where: { 
      isPublished: true,
      deletedAt: null, // Exclude soft-deleted products
    },
    select: {
      category: true,
      type: true,
      material: true,
    },
  })

  // Helper to get unique values case-insensitively
  const getUniqueValues = (values: (string | null)[]): string[] => {
    const seen = new Map<string, string>()
    values.forEach((value) => {
      if (value) {
        const lowerValue = value.toLowerCase()
        if (!seen.has(lowerValue)) {
          seen.set(lowerValue, value)
        }
      }
    })
    return Array.from(seen.values())
  }

  const categories = getUniqueValues(products.map((p) => p.category))
  const types = getUniqueValues(products.map((p) => p.type))
  const materials = getUniqueValues(products.map((p) => p.material))

  return { categories, types, materials }
}

export default async function ShopProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    type?: string
    material?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const products = await getProducts(params)
  const filterOptions = await getFilterOptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Our Collection</h1>
        <p className="text-gray-400 mt-2">Discover quality apparel for every occasion</p>
      </div>

      <ProductFilters filterOptions={filterOptions} />

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">No products found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            Showing {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
