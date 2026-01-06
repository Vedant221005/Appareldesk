"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
  const { data: session } = useSession()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if user is logged in
    if (!session) {
      router.push("/auth/login?callbackUrl=/shop/products")
      return
    }
    
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
      <Card className="overflow-hidden cursor-pointer h-full flex flex-col border-2 border-gray-800 hover:border-primary transition-all duration-300">
        <div className="relative aspect-[4/3] bg-gray-100">
          {hasImage ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Package className="h-16 w-16 text-primary" />
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

        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base line-clamp-2 text-white">{product.name}</h3>
          </div>

          {product.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            {product.category && (
              <Badge variant="outline" className="text-[10px] py-0 h-5 border-gray-700 text-gray-300">
                {product.category}
              </Badge>
            )}
            {product.type && (
              <Badge variant="outline" className="text-[10px] py-0 h-5 border-gray-700 text-gray-300">
                {product.type}
              </Badge>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {!isOutOfStock && (
                <span className="text-xs text-gray-500">
                  {product.stock} in stock
                </span>
              )}
            </div>

            <Button
              className="w-full h-9 text-sm"
              disabled={isOutOfStock || isAdding}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
