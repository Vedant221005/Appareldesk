"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
    
    // Reset type when category changes
    if (key === "category") {
      params.delete("type")
      setSelectedType("")
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
              <Badge variant="secondary" className="gap-2 text-white border-gray-700 pr-1">
                Search: {search}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-700"
                  onClick={() => {
                    setSearch("")
                    updateFilters("search", "")
                  }}
                >
                  <X className="h-3 w-3 hover:text-primary" />
                </Button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-2 text-white border-gray-700 pr-1">
                {selectedCategory}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedCategory("")
                    updateFilters("category", "")
                  }}
                >
                  <X className="h-3 w-3 hover:text-primary" />
                </Button>
              </Badge>
            )}
            {selectedType && (
              <Badge variant="secondary" className="gap-2 text-white border-gray-700 pr-1">
                {selectedType}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedType("")
                    updateFilters("type", "")
                  }}
                >
                  <X className="h-3 w-3 hover:text-primary" />
                </Button>
              </Badge>
            )}
            {selectedMaterial && (
              <Badge variant="secondary" className="gap-2 text-white border-gray-700 pr-1">
                {selectedMaterial}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-700"
                  onClick={() => {
                    setSelectedMaterial("")
                    updateFilters("material", "")
                  }}
                >
                  <X className="h-3 w-3 hover:text-primary" />
                </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Categories */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Category</label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                const newValue = value === "all" ? "" : value
                setSelectedCategory(newValue)
                updateFilters("category", newValue)
              }}
            >
              <SelectTrigger className="border-gray-700 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Types */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Type</label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                const newValue = value === "all" ? "" : value
                setSelectedType(newValue)
                updateFilters("type", newValue)
              }}
            >
              <SelectTrigger className="border-gray-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Material</label>
            <Select
              value={selectedMaterial}
              onValueChange={(value) => {
                const newValue = value === "all" ? "" : value
                setSelectedMaterial(newValue)
                updateFilters("material", newValue)
              }}
            >
              <SelectTrigger className="border-gray-700 text-white">
                <SelectValue placeholder="All Materials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {filterOptions.materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  )
}
