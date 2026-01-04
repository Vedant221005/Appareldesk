"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    description: string | null
    category: string | null
    type: string | null
    material: string | null
    price: number
    stock: number
    images: string[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const hasImage = product.images.length > 0 && product.images[0]
  const isOutOfStock = product.stock === 0
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      image: product.images[0] || null,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <Link href={`/shop/products/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100">
          {hasImage ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-gray-300" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
            {product.type && (
              <Badge variant="outline" className="text-xs">
                {product.type}
              </Badge>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                ₹{product.price.toLocaleString()}
              </span>
              {!isOutOfStock && (
                <span className="text-sm text-gray-500">
                  {product.stock} in stock
                </span>
              )}
            </div>

            <Button
              className="w-full"
              disabled={isOutOfStock || isAdding}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
