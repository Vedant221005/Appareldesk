import { prisma } from "@/lib/prisma"
import { ProductForm } from "../../product-form"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id: id },
  })

  if (!product || product.deletedAt) {
    notFound()
  }

  return product
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  // Transform product to match ProductForm expected type
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    category: product.category,
    type: product.type,
    material: product.material || "",
    price: product.price,
    stock: product.stock,
    images: product.images,
    isPublished: product.isPublished,
  }

  return <ProductForm product={productData} isEdit />
}
