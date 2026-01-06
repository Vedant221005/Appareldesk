import { prisma } from "@/lib/prisma"
import { ProductCard } from "./product-card"
import { ProductFilters } from "./product-filters"
import { Prisma } from "@prisma/client"
import { CATEGORIES, CATEGORY_TYPES, MATERIALS } from "@/lib/product-constants"

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

async function getFilterOptions(selectedCategory?: string) {
  // Always use the predefined categories
  const categories = [...CATEGORIES]
  
  // If a category is selected, show only its types; otherwise show all types
  const types = selectedCategory && CATEGORY_TYPES[selectedCategory]
    ? CATEGORY_TYPES[selectedCategory]
    : Object.values(CATEGORY_TYPES).flat()
  
  // Always use the predefined materials
  const materials = [...MATERIALS]

  return { 
    categories, 
    types: [...new Set(types)], // Remove duplicates
    materials 
  }
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
  const filterOptions = await getFilterOptions(params.category)

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
