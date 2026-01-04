"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  products: Array<{
    id: string
    name: string
    slug: string
    category: string
    price: number
    stock: number
    images: string[]
  }>
  orders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    orderDate: string
    customer: {
      name: string
      email: string
    }
  }>
  customers: Array<{
    id: string
    name: string
    email: string
    phone: string | null
    city: string | null
  }>
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({
    products: [],
    orders: [],
    customers: [],
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ products: [], orders: [], customers: [] })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (type: string, id: string, slug?: string) => {
    setOpen(false)
    setQuery("")
    
    if (type === "product") {
      router.push(`/shop/products/${slug}`)
    } else if (type === "order") {
      router.push(`/admin/orders/${id}`)
    } else if (type === "customer") {
      router.push(`/admin/customers`)
    }
  }

  const totalResults = results.products.length + results.orders.length + results.customers.length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors w-full max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 opacity-50" />}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto p-4">
            {query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}

            {query.length >= 2 && !loading && totalResults === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                  Products
                </h3>
                <div className="space-y-1">
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelect("product", product.id, product.slug)}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category} • ₹{product.price}
                        </div>
                      </div>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orders */}
            {results.orders.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                  Orders
                </h3>
                <div className="space-y-1">
                  {results.orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleSelect("order", order.id)}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {order.customer.name} • {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{order.total.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {results.customers.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                  Customers
                </h3>
                <div className="space-y-1">
                  {results.customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelect("customer", customer.id)}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {customer.email} {customer.phone && `• ${customer.phone}`}
                        </div>
                      </div>
                      {customer.city && (
                        <div className="text-sm text-muted-foreground">{customer.city}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
