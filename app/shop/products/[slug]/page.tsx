import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import Image from "next/image"
import { ProductImageGallery } from "./product-image-gallery"
import { AddToCartButton } from "./add-to-cart-button"

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { 
      slug: slug,
      isPublished: true,
    },
  })

  if (!product) {
    notFound()
  }

  return product
}

async function getRelatedProducts(productId: string, category: string | null) {
  if (!category) return []

  return await prisma.product.findMany({
    where: {
      id: { not: productId },
      category: category,
      isPublished: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  const relatedProducts = await getRelatedProducts(product.id, product.category)

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 10

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/shop/products">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <ProductImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex gap-2 mb-3">
              {product.category && (
                <Badge variant="outline">{product.category}</Badge>
              )}
              {product.type && (
                <Badge variant="outline">{product.type}</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-4xl font-bold text-green-600">
              ₹{product.price.toLocaleString()}
            </p>
          </div>

          {product.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Product Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.material && (
                <div>
                  <span className="text-gray-500">Material:</span>
                  <p className="font-medium">{product.material}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Stock:</span>
                <p className="font-medium">
                  {isOutOfStock ? (
                    <span className="text-red-600">Out of Stock</span>
                  ) : isLowStock ? (
                    <span className="text-orange-600">Only {product.stock} left</span>
                  ) : (
                    <span className="text-green-600">{product.stock} available</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-3">
            <AddToCartButton 
              productId={product.id}
              productName={product.name}
              slug={product.slug}
              price={product.price}
              stock={product.stock}
              image={product.images[0] || null}
              isOutOfStock={isOutOfStock}
            />

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>Free delivery on orders above ₹999</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/shop/products/${relatedProduct.slug}`}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative aspect-square bg-gray-100">
                      {relatedProduct.images[0] ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl">📦</div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xl font-bold text-green-600">
                        ₹{relatedProduct.price.toLocaleString()}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
