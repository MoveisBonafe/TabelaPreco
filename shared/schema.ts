import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  active: z.boolean(),
  productCount: z.number(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  basePrice: z.number(),
  discount: z.number(),
  finalPrice: z.number(),
  image: z.string(),
  specifications: z.array(z.string()).optional(),
  active: z.boolean(),
  createdAt: z.date(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, finalPrice: true });
export const insertCategorySchema = categorySchema.omit({ id: true, productCount: true });

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
