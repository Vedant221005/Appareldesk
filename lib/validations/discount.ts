import { z } from "zod"

export const discountOfferSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0, "Discount value must be positive"),
  minOrderAmount: z.coerce.number().min(0, "Minimum order amount must be positive"),
  maxDiscountAmount: z.coerce.number().min(0, "Maximum discount amount must be positive").optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().default(true),
})

export type DiscountOfferFormData = z.infer<typeof discountOfferSchema>

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string(),
  discountOfferId: z.string().min(1, "Discount offer is required"),
  maxUsageCount: z.coerce.number().min(1, "Max usage must be at least 1").default(1),
  maxUsagePerUser: z.coerce.number().min(1, "Max usage per user must be at least 1").default(1),
  isActive: z.boolean().default(true),
  contactId: z.string().optional(),
})

export type CouponFormData = z.infer<typeof couponSchema>
