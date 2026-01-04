"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FilterChip {
  label: string
  value: string
  onRemove: () => void
}

interface FilterChipsProps {
  filters: FilterChip[]
  onClearAll?: () => void
}

export function FilterChips({ filters, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter, index) => (
        <Badge key={`${filter.value}-${index}`} variant="secondary" className="gap-1 pr-1">
          <span className="text-xs">{filter.label}</span>
          <button
            onClick={filter.onRemove}
            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {filters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
