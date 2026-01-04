"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface BulkUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  type: "products" | "orders"
  onSuccess: () => void
}

export function BulkUpdateDialog({
  open,
  onOpenChange,
  selectedIds,
  type,
  onSuccess,
}: BulkUpdateDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updates, setUpdates] = useState<any>({})

  const handleUpdate = async () => {
    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one field to update")
      return
    }

    setIsUpdating(true)

    try {
      const endpoint =
        type === "products"
          ? "/api/admin/products/bulk"
          : "/api/admin/orders/bulk"

      const body =
        type === "products"
          ? { productIds: selectedIds, updates }
          : { orderIds: selectedIds, status: updates.status }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onOpenChange(false)
        setUpdates({})
        onSuccess()
      } else {
        toast.error(data.error || "Update failed")
      }
    } catch (error) {
      console.error("Bulk update error:", error)
      toast.error("Failed to update " + type)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update {type}</DialogTitle>
          <DialogDescription>
            Update {selectedIds.length} {type} at once. Leave fields empty to
            keep current values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === "products" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter new price"
                  onChange={(e) =>
                    setUpdates({
                      ...updates,
                      price: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="Enter new stock quantity"
                  onChange={(e) =>
                    setUpdates({
                      ...updates,
                      stock: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setUpdates({ ...updates, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Topwear">Topwear</SelectItem>
                    <SelectItem value="Bottomwear">Bottomwear</SelectItem>
                    <SelectItem value="Footwear">Footwear</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isPublished">Visibility</Label>
                <Select
                  onValueChange={(value) =>
                    setUpdates({ ...updates, isPublished: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                onValueChange={(value) => setUpdates({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : `Update ${selectedIds.length} ${type}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
