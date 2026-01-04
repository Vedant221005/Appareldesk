"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

interface ProductFiltersProps {
  filterOptions: {
    categories: string[]
    types: string[]
    materials: string[]
  }
}

export function ProductFilters({ filterOptions }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "")
  const [selectedMaterial, setSelectedMaterial] = useState(searchParams.get("material") || "")

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/shop/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setSelectedType("")
    setSelectedMaterial("")
    router.push("/shop/products")
  }

  const hasActiveFilters = search || selectedCategory || selectedType || selectedMaterial

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("search", search)
  }

  return (
    <Card className="p-6 border-2 border-gray-800">
      <div className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">Active Filters:</span>
            {search && (
              <Badge variant="secondary" className="gap-1 text-white border-gray-700">
                Search: {search}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => {
                    setSearch("")
                    updateFilters("search", "")
                  }}
                />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1 text-white border-gray-700">
                {selectedCategory}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => {
                    setSelectedCategory("")
                    updateFilters("category", "")
                  }}
                />
              </Badge>
            )}
            {selectedType && (
              <Badge variant="secondary" className="gap-1 text-white border-gray-700">
                {selectedType}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => {
                    setSelectedType("")
                    updateFilters("type", "")
                  }}
                />
              </Badge>
            )}
            {selectedMaterial && (
              <Badge variant="secondary" className="gap-1 text-white border-gray-700">
                {selectedMaterial}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary"
                  onClick={() => {
                    setSelectedMaterial("")
                    updateFilters("material", "")
                  }}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-500 hover:text-red-400"
            >
              Clear All
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories */}
          {filterOptions.categories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-white">Category</h3>
              <div className="space-y-2">
                {filterOptions.categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      const newValue = selectedCategory === category ? "" : category
                      setSelectedCategory(newValue)
                      updateFilters("category", newValue)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-black font-medium"
                        : "text-gray-300 hover:text-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Types */}
          {filterOptions.types.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-white">Type</h3>
              <div className="space-y-2">
                {filterOptions.types.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const newValue = selectedType === type ? "" : type
                      setSelectedType(newValue)
                      updateFilters("type", newValue)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedType === type
                        ? "bg-primary text-black font-medium"
                        : "text-gray-300 hover:text-primary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {filterOptions.materials.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-white">Material</h3>
              <div className="space-y-2">
                {filterOptions.materials.map((material) => (
                  <button
                    key={material}
                    onClick={() => {
                      const newValue = selectedMaterial === material ? "" : material
                      setSelectedMaterial(newValue)
                      updateFilters("material", newValue)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedMaterial === material
                        ? "bg-primary text-black font-medium"
                        : "text-gray-300 hover:text-primary"
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
