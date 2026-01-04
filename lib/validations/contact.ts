import { z } from "zod"

export const contactSchema = z.object({
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.string(),
  gstNumber: z.string()
})

export type ContactFormData = z.infer<typeof contactSchema>
