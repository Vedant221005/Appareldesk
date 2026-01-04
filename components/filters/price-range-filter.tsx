"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface PriceRangeFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {
  return (
    <div className="space-y-4">
      <Label>Price Range</Label>
      <Slider
        min={min}
        max={max}
        step={10}
        value={value}
        onValueChange={(val: number[]) => onChange(val as [number, number])}
        className="w-full"
      />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="number"
            value={value[0]}
            onChange={(e) => onChange([parseInt(e.target.value) || min, value[1]])}
            min={min}
            max={value[1]}
            className="h-8"
          />
          <p className="text-xs text-muted-foreground mt-1">Min: ₹{value[0]}</p>
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex-1">
          <Input
            type="number"
            value={value[1]}
            onChange={(e) => onChange([value[0], parseInt(e.target.value) || max])}
            min={value[0]}
            max={max}
            className="h-8"
          />
          <p className="text-xs text-muted-foreground mt-1">Max: ₹{value[1]}</p>
        </div>
      </div>
    </div>
  )
}
