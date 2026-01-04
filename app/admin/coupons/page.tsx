"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Tag, Users } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface DiscountOffer {
  id: string
  name: string
  discountType: string
  discountValue: number
}

interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  discountOfferId: string
  discountOffer: DiscountOffer
  maxUsageCount: number
  usedCount: number
  maxUsagePerUser: number
  isActive: boolean
  contactId: string | null
  contact: { name: string } | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [offers, setOffers] = useState<DiscountOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountOfferId: "",
    maxUsageCount: 100,
    maxUsagePerUser: 1,
    isActive: true,
  })

  useEffect(() => {
    fetchCoupons()
    fetchOffers()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      setCoupons(data)
    } catch (error) {
      toast.error("Failed to fetch coupons")
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/admin/discount-offers")
      const data = await res.json()
      setOffers(data.filter((o: any) => o.isActive))
    } catch (error) {
      console.error("Failed to fetch offers")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.discountOfferId) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      const method = editingCoupon ? "PUT" : "POST"
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save coupon")
      }

      toast.success(
        editingCoupon ? "Coupon updated!" : "Coupon created successfully!"
      )
      setOpen(false)
      resetForm()
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discountOfferId: coupon.discountOfferId,
      maxUsageCount: coupon.maxUsageCount,
      maxUsagePerUser: coupon.maxUsagePerUser,
      isActive: coupon.isActive,
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")

      toast.success("Coupon deleted")
      fetchCoupons()
    } catch (error) {
      toast.error("Failed to delete coupon")
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountOfferId: "",
      maxUsageCount: 100,
      maxUsagePerUser: 1,
      isActive: true,
    })
    setEditingCoupon(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-1">
            Manage coupon codes for discount offers
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription>
                Create a unique coupon code linked to a discount offer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., SUMMER20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Coupon Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Summer Sale Coupon"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional coupon description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountOfferId">Discount Offer *</Label>
                <Select
                  value={formData.discountOfferId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discountOfferId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {offers.map((offer) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name} ({offer.discountType === "PERCENTAGE" ? `${offer.discountValue}%` : `$${offer.discountValue}`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsageCount">Max Total Uses</Label>
                  <Input
                    id="maxUsageCount"
                    type="number"
                    min="1"
                    value={formData.maxUsageCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsageCount: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsagePerUser">Max Uses Per User</Label>
                  <Input
                    id="maxUsagePerUser"
                    type="number"
                    min="1"
                    value={formData.maxUsagePerUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsagePerUser: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCoupon ? "Update" : "Create"} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No coupons created yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first coupon to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="px-3 py-1 bg-primary/10 text-primary font-mono font-semibold rounded">
                        {coupon.code}
                      </code>
                      <h3 className="font-semibold">{coupon.name}</h3>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {coupon.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        Offer: <strong>{coupon.discountOffer.name}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Used: <strong>{coupon.usedCount}/{coupon.maxUsageCount}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Max per user: <strong>{coupon.maxUsagePerUser}</strong>
                      </span>
                      {coupon.contact && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Exclusive for: <strong>{coupon.contact.name}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
