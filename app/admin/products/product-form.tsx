"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { productSchema, ProductFormData } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { CATEGORIES, CATEGORY_TYPES, MATERIALS } from "@/lib/product-constants"

interface ProductFormProps {
  product?: ProductFormData & { id: string }
  isEdit?: boolean
}

// Helper function to normalize text to proper case
const normalizeText = (text: string): string => {
  if (!text) return text
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ProductForm({ product, isEdit }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product ? {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
    } : {
      name: "",
      slug: "",
      description: "",
      category: "",
      type: "",
      material: "",
      price: 0,
      stock: 0,
      images: [],
      isPublished: true,
    },
  })

  // Watch category changes and reset type when category changes
  const currentCategory = watch("category")
  useEffect(() => {
    if (currentCategory && currentCategory !== selectedCategory && !isEdit) {
      setValue("type", "")
      setSelectedCategory(currentCategory)
    }
  }, [currentCategory, selectedCategory, setValue, isEdit])

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setValue("slug", slug)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload images")
      }

      const data = await response.json()
      const newImages = [...images, ...data.urls]
      setImages(newImages)
      setValue("images", newImages)
      toast.success("Images uploaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setValue("images", newImages)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      // Normalize category, type, and material to proper case
      const normalizedData = {
        ...data,
        category: data.category ? normalizeText(data.category) : data.category,
        type: data.type ? normalizeText(data.type) : data.type,
        material: data.material ? normalizeText(data.material) : data.material,
        images,
      }

      const url = isEdit ? `/api/admin/products/${product?.id}` : "/api/admin/products"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save product")
      }

      toast.success(isEdit ? "Product updated successfully" : "Product created successfully")
      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Update product information" : "Add a new product to your catalog"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, category, and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={(e) => {
                    register("name").onChange(e)
                    if (!isEdit) handleNameChange(e)
                  }}
                  placeholder="Premium Cotton T-Shirt"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="premium-cotton-tshirt"
                  disabled={isSubmitting}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed product description..."
                rows={4}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedCategory(value)
                        if (!isEdit) {
                          setValue("type", "")
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-gray-800 bg-black text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-800">
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category} className="text-white hover:bg-gray-900">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || !watch("category")}
                    >
                      <SelectTrigger className="border-gray-800 bg-black text-white">
                        <SelectValue placeholder={watch("category") ? "Select type" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-800">
                        {watch("category") && CATEGORY_TYPES[watch("category")]?.map((type) => (
                          <SelectItem key={type} value={type} className="text-white hover:bg-gray-900">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Controller
                  name="material"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="border-gray-800 bg-black text-white">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-800">
                        {MATERIALS.map((material) => (
                          <SelectItem key={material} value={material} className="text-white hover:bg-gray-900">
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.material && (
                  <p className="text-sm text-red-600">{errors.material.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload up to 5 product images (Max 5MB each)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Button */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading || images.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= 5}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
              <span className="text-sm text-gray-400">
                {images.length} / 5 images
              </span>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square border-2 border-gray-800 rounded-lg overflow-hidden group hover:border-primary transition-colors"
                  >
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-black text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-800 rounded-lg p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">No images uploaded</p>
                <p className="text-sm text-gray-500">
                  Click &quot;Upload Images&quot; to add product photos
                </p>
              </div>
            )}

            {errors.images && (
              <p className="text-sm text-red-600">{errors.images.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set product price and stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                  placeholder="999.00"
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock")}
                  placeholder="100"
                  disabled={isSubmitting}
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Control product visibility on storefront</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {watch("isPublished")
                    ? "Product is visible to customers"
                    : "Product is hidden from customers"}
                </p>
              </div>
              <Controller
                name="isPublished"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
