import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  description: z.string(),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  material: z.string(),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  images: z.array(z.string()),
  isPublished: z.boolean()
})

export type ProductFormData = z.infer<typeof productSchema>
