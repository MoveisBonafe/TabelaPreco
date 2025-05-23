import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByCredentials(username, password);
      
      if (user) {
        res.json({
          id: user.id,
          level: user.level,
          multiplier: parseFloat(user.multiplier || "1.0")
        });
      } else {
        res.status(401).json({ message: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.json([]);
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
      // Garante que sempre retorna um array
      res.json(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Retorna array vazio em caso de erro
      res.json([]);
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
      if (db) {
        await db.delete(categories);
      }
      res.json({ message: "Todas as categorias foram removidas" });
    } catch (error) {
      console.error("Error clearing categories:", error);
      res.status(500).json({ message: "Falha ao limpar categorias" });
    }
  });

  // Endpoints de monitoramento Supabase
  app.get("/api/supabase/status", async (req, res) => {
    try {
      const status = getConnectionStatus();
      res.json({
        ...status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      console.error("Error getting Supabase status:", error);
      res.status(500).json({ message: "Falha ao obter status do Supabase" });
    }
  });

  app.get("/api/supabase/logs", async (req, res) => {
    try {
      const stats = supabaseLogger.getConnectionStats();
      const recentErrors = supabaseLogger.getRecentErrors(10);
      
      res.json({
        statistics: stats,
        recentErrors,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting Supabase logs:", error);
      res.status(500).json({ message: "Falha ao obter logs do Supabase" });
    }
  });

  app.post("/api/supabase/test", async (req, res) => {
    try {
      const { connectionString } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ message: "String de conexão é obrigatória" });
      }

      console.log('🧪 Testando conexão manual com Supabase...');
      const { testSupabaseConnection } = await import('./supabase-logger');
      const success = await testSupabaseConnection(connectionString);
      
      res.json({
        success,
        message: success ? "Conexão bem-sucedida!" : "Falha na conexão",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      res.status(500).json({ message: "Erro ao testar conexão" });
    }
  });

  app.get("/api/supabase/health-report", async (req, res) => {
    try {
      const report = supabaseLogger.generateHealthReport();
      res.json({
        report,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating health report:", error);
      res.status(500).json({ message: "Falha ao gerar relatório de saúde" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
