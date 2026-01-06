export const CATEGORIES = [
  "Topwear",
  "Bottomwear",
  "Outerwear",
  "Winterwear",
  "Sportswear",
  "Ethnicwear",
  "Formalwear",
] as const

export const CATEGORY_TYPES: Record<string, string[]> = {
  Topwear: ["T-Shirt", "Shirt", "Polo", "Kurta"],
  Bottomwear: ["Jeans", "Chinos", "Shorts", "Track Pants", "Cargo"],
  Outerwear: ["Jacket", "Hoodie", "Blazer"],
  Winterwear: ["Sweater", "Coat"],
  Sportswear: ["Gym T-Shirt", "Sports Shorts", "Track Pants"],
  Ethnicwear: ["Kurta", "Kurti", "Sherwani"],
  Formalwear: ["Formal Shirt", "Trousers", "Blazer"],
}

export const MATERIALS = [
  "Cotton",
  "Polyester",
  "Denim",
  "Linen",
  "Wool",
  "Nylon",
  "Rayon",
] as const

export type Category = (typeof CATEGORIES)[number]
export type Material = (typeof MATERIALS)[number]
