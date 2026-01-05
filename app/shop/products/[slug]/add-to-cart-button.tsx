"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
  productName: string
  slug: string
  price: number
  stock: number
  image: string | null
  isOutOfStock: boolean
}

export function AddToCartButton({ 
  productId, 
  productName, 
  slug,
  price,
  stock,
  image,
  isOutOfStock 
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!session) {
      router.push(`/auth/login?callbackUrl=/shop/products/${slug}`)
      return
    }
    
    setIsAdding(true)
    addItem({
      productId,
      productName,
      slug,
      price,
      stock,
      image,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isOutOfStock || isAdding}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
