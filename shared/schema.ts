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
  priceAVista: z.number(), // Preço à vista (base para cálculos)
  price30: z.number(), // À vista + 2%
  price30_60: z.number(), // À vista + 4%
  price30_60_90: z.number(), // À vista + 6%
  price30_60_90_120: z.number(), // À vista + 8%
  image: z.string(), // Imagem principal (para compatibilidade)
  images: z.array(z.string()).default([]), // Array de múltiplas imagens
  specifications: z.array(z.string()).optional(),
  active: z.boolean(),
  fixedPrice: z.boolean().default(false), // Se true, preço não é alterado pelo multiplicador
  createdAt: z.date(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, finalPrice: true, price30: true, price30_60: true, price30_60_90: true, price30_60_90_120: true });
export const insertCategorySchema = categorySchema.omit({ id: true, productCount: true });

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
