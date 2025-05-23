import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { productStorage } from "./product-storage";
import { insertProductSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await productStorage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await productStorage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Special route for bulk import that avoids duplicates
  app.post("/api/products/bulk-import", async (req, res) => {
    try {
      const { products: productsData } = req.body;
      const results = [];
      
      for (const productData of productsData) {
        const validatedProduct = insertProductSchema.parse(productData);
        const result = await productStorage.createOrUpdateProduct(validatedProduct);
        results.push(result);
      }
      
      res.json({ 
        message: `${results.length} produtos processados com sucesso!`,
        products: results 
      });
    } catch (error) {
      console.error("Error in bulk import:", error);
      res.status(500).json({ message: "Erro na importação em lote" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await productStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
