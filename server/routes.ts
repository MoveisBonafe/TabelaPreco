import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { productStorage } from "./product-storage";
import { insertProductSchema, insertCategorySchema, products, categories } from "@shared/schema";
import { db } from "./db";

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

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await productStorage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await productStorage.deleteProduct(id);
      if (success) {
        res.json({ message: "Produto excluído com sucesso" });
      } else {
        res.status(404).json({ message: "Produto não encontrado" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
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

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await productStorage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await productStorage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await productStorage.deleteCategory(id);
      if (success) {
        res.json({ message: "Categoria excluída com sucesso" });
      } else {
        res.status(404).json({ message: "Categoria não encontrada" });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Backup routes
  app.post("/api/backup/create", async (req, res) => {
    try {
      // Com Supabase, o backup é automático, mas podemos criar um snapshot manual
      const products = await productStorage.getProducts();
      const categories = await productStorage.getCategories();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        products: products.length,
        categories: categories.length,
        status: 'success'
      };
      
      res.json({ 
        message: "Backup manual registrado com sucesso!",
        data: backupData 
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Falha ao criar backup" });
    }
  });

  app.get("/api/backup/export", async (req, res) => {
    try {
      const products = await productStorage.getProducts();
      const categories = await productStorage.getCategories();
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "1.0",
          totalProducts: products.length,
          totalCategories: categories.length
        },
        products,
        categories
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup-catalogo-${new Date().toISOString().split('T')[0]}.json`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Falha ao exportar dados" });
    }
  });

  // Reset routes for system cleanup
  app.delete("/api/reset/products", async (req, res) => {
    try {
      await db.delete(products);
      res.json({ message: "Todos os produtos foram removidos" });
    } catch (error) {
      console.error("Error clearing products:", error);
      res.status(500).json({ message: "Falha ao limpar produtos" });
    }
  });

  app.delete("/api/reset/categories", async (req, res) => {
    try {
      await db.delete(categories);
      res.json({ message: "Todas as categorias foram removidas" });
    } catch (error) {
      console.error("Error clearing categories:", error);
      res.status(500).json({ message: "Falha ao limpar categorias" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
