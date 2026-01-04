"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "sonner"

export interface CartItem {
  productId: string
  productName: string
  slug: string
  price: number
  quantity: number
  image: string | null
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "appareldesk_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save cart:", error)
      }
    }
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.productId === item.productId)

      if (existingItem) {
        const newQuantity = existingItem.quantity + (item.quantity || 1)
        
        if (newQuantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`)
          return currentItems
        }

        toast.success("Cart updated")
        return currentItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQuantity }
            : i
        )
      }

      toast.success("Added to cart")
      return [...currentItems, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((i) => i.productId !== productId))
    toast.success("Removed from cart")
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }

    setItems((currentItems) => {
      const item = currentItems.find((i) => i.productId === productId)
      
      if (item && quantity > item.stock) {
        toast.error(`Only ${item.stock} items available in stock`)
        return currentItems
      }

      return currentItems.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    })
  }

  const clearCart = () => {
    setItems([])
    toast.success("Cart cleared")
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
