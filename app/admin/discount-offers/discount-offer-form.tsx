"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { discountOfferSchema, DiscountOfferFormData } from "@/lib/validations/discount"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface DiscountOfferFormProps {
  offer?: DiscountOfferFormData & { id: string }
  isEdit?: boolean
}

export function DiscountOfferForm({ offer, isEdit }: DiscountOfferFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit: handleSubmitForm,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(discountOfferSchema),
    defaultValues: offer || {
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      isActive: true,
    },
  } as const)

  const onSubmit = async (data: DiscountOfferFormData) => {
    setIsSubmitting(true)
    try {
      const url = isEdit
        ? `/api/admin/discount-offers/${offer?.id}`
        : "/api/admin/discount-offers"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save offer")
      }

      toast.success(isEdit ? "Offer updated" : "Offer created")
      router.push("/admin/discount-offers")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const discountType = watch("discountType")
  const isActive = watch("isActive")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/discount-offers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Discount Offer" : "Create Discount Offer"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Update offer details" : "Set up a new promotional discount"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitForm(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
            <CardDescription>Basic information about the discount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Offer Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Summer Sale 2026"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Special summer discount for all products"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Active Status</Label>
                <p className="text-sm text-gray-500">
                  Enable or disable this offer
                </p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Configuration</CardTitle>
            <CardDescription>Set discount type and value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={discountType}
                  onValueChange={(value) => setValue("discountType", value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType && (
                  <p className="text-sm text-red-600">{errors.discountType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * {discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  {...register("discountValue")}
                  placeholder={discountType === "PERCENTAGE" ? "10" : "100"}
                  disabled={isSubmitting}
                />
                {errors.discountValue && (
                  <p className="text-sm text-red-600">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Minimum Order Amount (₹) *</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  step="0.01"
                  {...register("minOrderAmount")}
                  placeholder="500"
                  disabled={isSubmitting}
                />
                {errors.minOrderAmount && (
                  <p className="text-sm text-red-600">{errors.minOrderAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">
                  Maximum Discount Cap (₹) {discountType === "PERCENTAGE" ? "*" : ""}
                </Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  step="0.01"
                  {...register("maxDiscountAmount")}
                  placeholder="1000"
                  disabled={isSubmitting}
                />
                {errors.maxDiscountAmount && (
                  <p className="text-sm text-red-600">{errors.maxDiscountAmount.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
            <CardDescription>Set start and end dates for the offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/discount-offers">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Offer" : "Create Offer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
