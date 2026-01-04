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

  return <ProductForm product={product} isEdit />
}
