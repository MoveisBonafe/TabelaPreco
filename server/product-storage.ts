import { products, categories, type Product, type Category, type InsertProduct, type InsertCategory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IProductStorage {
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  findProductByName(name: string): Promise<Product | undefined>;
  createOrUpdateProduct(product: InsertProduct): Promise<Product>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
}

export class DatabaseProductStorage implements IProductStorage {
  // Product operations
  async getProducts(): Promise<Product[]> {
    const result = await db.select().from(products).orderBy(desc(products.createdAt));
    return result.map(this.mapProductFromDb);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.id, id));
    return result ? this.mapProductFromDb(result) : undefined;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const calculatedData = this.calculatePrices(productData);
    
    const [result] = await db
      .insert(products)
      .values({
        ...productData,
        ...calculatedData,
        images: JSON.stringify(productData.images || []),
        specifications: JSON.stringify(productData.specifications || []),
      })
      .returning();
    
    await this.updateCategoryCount();
    return this.mapProductFromDb(result);
  }

  async findProductByName(name: string): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.name, name));
    return result ? this.mapProductFromDb(result) : undefined;
  }

  async createOrUpdateProduct(productData: InsertProduct): Promise<Product> {
    const existingProduct = await this.findProductByName(productData.name);
    
    if (existingProduct) {
      // Atualiza produto existente
      return await this.updateProduct(parseInt(existingProduct.id), productData) || existingProduct;
    } else {
      // Cria novo produto
      return await this.createProduct(productData);
    }
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const calculatedData = productData.priceAVista ? this.calculatePrices(productData as InsertProduct) : {};
    
    const updateData: any = { ...productData, ...calculatedData };
    if (productData.images) updateData.images = JSON.stringify(productData.images);
    if (productData.specifications) updateData.specifications = JSON.stringify(productData.specifications);
    
    const [result] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    
    await this.updateCategoryCount();
    return result ? this.mapProductFromDb(result) : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    await this.updateCategoryCount();
    return result.rowCount > 0;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(categories.name);
    return result.map(this.mapCategoryFromDb);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [result] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    
    return this.mapCategoryFromDb(result);
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [result] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    
    return result ? this.mapCategoryFromDb(result) : undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }

  // Helper methods
  private calculatePrices(productData: InsertProduct) {
    const basePrice = productData.priceAVista;
    return {
      finalPrice: basePrice * (1 - (productData.discount || 0) / 100),
      price30: basePrice * 1.02,
      price30_60: basePrice * 1.04,
      price30_60_90: basePrice * 1.06,
      price30_60_90_120: basePrice * 1.08,
    };
  }

  private mapProductFromDb(dbProduct: any): Product {
    return {
      id: dbProduct.id.toString(),
      name: dbProduct.name,
      description: dbProduct.description || "",
      category: dbProduct.category,
      basePrice: parseFloat(dbProduct.basePrice),
      discount: parseFloat(dbProduct.discount || 0),
      finalPrice: parseFloat(dbProduct.finalPrice),
      priceAVista: parseFloat(dbProduct.priceAVista),
      price30: parseFloat(dbProduct.price30),
      price30_60: parseFloat(dbProduct.price30_60),
      price30_60_90: parseFloat(dbProduct.price30_60_90),
      price30_60_90_120: parseFloat(dbProduct.price30_60_90_120),
      image: dbProduct.image || "",
      images: Array.isArray(dbProduct.images) ? dbProduct.images : JSON.parse(dbProduct.images || "[]"),
      specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : JSON.parse(dbProduct.specifications || "[]"),
      active: dbProduct.active,
      fixedPrice: dbProduct.fixedPrice || false,
      createdAt: dbProduct.createdAt,
    };
  }

  private mapCategoryFromDb(dbCategory: any): Category {
    return {
      id: dbCategory.id.toString(),
      name: dbCategory.name,
      description: dbCategory.description || "",
      icon: dbCategory.icon || "",
      color: dbCategory.color || "",
      active: dbCategory.active,
      productCount: dbCategory.productCount || 0,
    };
  }

  private async updateCategoryCount() {
    const allCategories = await db.select().from(categories);
    
    for (const category of allCategories) {
      const [count] = await db
        .select({ count: products.id })
        .from(products)
        .where(eq(products.category, category.name));
        
      await db
        .update(categories)
        .set({ productCount: count.count || 0 })
        .where(eq(categories.id, category.id));
    }
  }
}

export const productStorage = new DatabaseProductStorage();