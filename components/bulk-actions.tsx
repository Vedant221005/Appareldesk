"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
  onUpdate?: () => void
  onDelete?: (ids: string[]) => Promise<void>
  type: "products" | "orders"
}

export function BulkActions({
  selectedIds,
  onClearSelection,
  onUpdate,
  onDelete,
  type,
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsLoading(true)
    try {
      await onDelete(selectedIds)
      toast.success(`Successfully deleted ${selectedIds.length} ${type}`)
      onClearSelection()
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${type}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
        <Checkbox checked disabled />
        <span className="text-sm font-medium">
          {selectedIds.length} {type} selected
        </span>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                Actions <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onUpdate && (
                <DropdownMenuItem onClick={onUpdate}>
                  <Edit className="mr-2 h-4 w-4" />
                  Bulk Update
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} {type}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
